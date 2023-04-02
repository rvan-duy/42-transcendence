import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MsgDto, MsgService } from '../msg/msg.service';
import { GateService } from 'src/gate/gate.service';
import { roomDto, RoomService } from 'src/room/room.service';
import { JwtService } from '@nestjs/jwt';
import { User, Room } from '@prisma/client';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
		private msgService: MsgService,
		private roomService: RoomService,
    private userService: PrismaUserService,
    private jwtService: JwtService,
    private gate: GateService,
  ){}
  private server: Server;
  // private gateService: GateService;

  @WebSocketServer() all_clients: Server; //all clients
  
  @SubscribeMessage('sendMsg')
  handleMessage(client: Socket, packet: any) {
    const id = packet.id;
    // const user = packet.username;
    const text = packet.msg;
    this.all_clients.emit('receiveNewMsg', packet);
	
    const dto: MsgDto = {id: -1, roomId: 1, body: text, authorId: id, invite: false};
    this.msgService.handleIncomingMsg(dto);  // handles db placement of the new msg based on sender id
  }

  afterInit(server: Server) {
    this.server = server;
    console.log('Gateway initialised.');
  }

  async handleConnection(client: Socket) {
    // experimental funcitionality below!!!
    const user: User = await this.jwtService.verify(
      client.handshake.query.token as string,
    );
    this.gate.addSocket(user.id, client);

    // get all chats from the user here and add them to loadAllChats
    const userWithChats = await this.userService.UserChats({id: user.id});
    const chatsFromUser = userWithChats.rooms as Room[];

    // get public chats and add them to the list
    const publicChats = await this.roomService.getPublicRooms();
    const combinedChats = chatsFromUser.concat(publicChats);

    // send the loadAllChats socket-msg with the chats you are activel in!
    client.emit('loadAllChats', combinedChats);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected from chat`);
    this.gate.removeSocket(client);
  }

  // send update to all ppl in chat who are online
  // do we need to find out who is all online through gate service?
  spreadMessage(msg: MsgDto) {
    this.server.emit('receiveNewMsg', msg);
  }

  @SubscribeMessage('loadRequest')
  async handleLoad(client: any, roomId: number) { // client verification?
    console.log('/chat/load received roomId:', roomId);

    const data = await this.msgService.getChatHistory(roomId);
    client.emit('loadChatHistory', data);
  }

  @SubscribeMessage('deleteMsg')
  handleDeleteMsg(client: any, payload: MsgDto) { // client verification?

    // verify that it is either an admin or the client self?
    console.log('Received delete Request:', payload);
    this.msgService.handleDeleteMsg(payload);
  }
  
  @SubscribeMessage('createRoom')
  createNewRoom(client: any, payload: roomDto) { // client verification? / extraction
    // verify that it is either an admin or the client self?
    console.log('Received delete Request:', client);
    this.roomService.createChat(payload);
  }

  @SubscribeMessage('destroyRoom')
  destroyRoom(client: any, payload: any) { // client verification? / extraction
    const roomId: number = payload;
    this.roomService.removeChat(roomId);
  }

  // check if this needs to be an invite according to pdf || think adding is enough
  @SubscribeMessage('addUserToRoom')
  addUserToRoom(client: any, payload: any) { // client verification? / extraction
    const {roomId, userId} = payload;
    this.roomService.addToChat(userId, roomId);
  }

  @SubscribeMessage('makeUserAdmin')
  makeUserAdmin(client: any, payload: any) { // client verification? / extraction
    const {roomId, userId} = payload;
    // check if the user sending this is admin or owner!
    this.roomService.makeAdmin(roomId, userId);
  }

  @SubscribeMessage('banUserFromRoom')
  banUserFromRoom(client: any, payload: any) { // client verification? / extraction
    const {roomId, userId} = payload;
    // check if the user sending this is admin or owner!
    this.roomService.banUser(roomId, userId);
  }

  @SubscribeMessage('muteUserInRoom')
  muteUserInRoom(client: any, payload: any) { // client verification? / extraction
    // not implemented yet
    console.warn(`${client} is unused`);
    console.warn(`${payload} is unused`);
  }
}
