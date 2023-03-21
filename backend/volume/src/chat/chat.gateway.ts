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
import { roomDto, RoomService } from 'src/room/room.service';
import * as moment from 'moment';
// import { PrismaMsgService } from 'src/msg/prisma/prismaMsg.service';

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
  ){}
  private server: Server;

  @WebSocketServer() all_clients: Server; //all clients
  
  @SubscribeMessage('sendMsg')
  handleMessage(client: Socket, packet: any) {
    const id = packet.id;
    const user = packet.username;
    const text = packet.msg;
    console.log(`Server received msg: "${text}" from client: ${client.id} (${user})`);
    this.all_clients.emit('receiveNewMsg', this.formatMessage(user, text));
	
    const dto: MsgDto = {id: -1, roomId: 1, body: text, authorId: id, invite: false};
    this.msgService.handleIncomingMsg(dto);  // handles db placement of the new msg based on sender id
  }

  afterInit(server: Server) {
    this.server = server;
    console.log('Gateway initialised.');
  }

  handleConnection(client: Socket) {
    // client.broadcast.emit('msgToClient', this.formatMessage('Rubot','A new user joined the chat.')); //all OTHER clients
    // client.emit('msgToClient', this.formatMessage('Rubot','Welcome to the chat!')); //this client
    // console.log(`Client ${client.id} connected`);

    client.emit('loadAllChats'); // data, all chats roomDto[]
  }

  handleDisconnect(client: Socket) {
    this.all_clients.emit('msgToClient', this.formatMessage('Rubot','A user left the chat.')); //all clients
    console.log(`Client ${client.id} disconnected`);
  }

  formatMessage(username, message_body)
  {
    return {
      username: username,
      body: message_body,
      time: moment().add(1, 'hours').format('HH:mm')
    };
  }

  // send update to all ppl in chat who are online
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
