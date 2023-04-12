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
import { RoomService } from 'src/room/room.service';
import { Room } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { ChatService } from './chat.service';

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
    private gate: GateService,
    private chatService: ChatService,
    private jwtService: JwtService,
  ){}
  private server: Server;

  @WebSocketServer() all_clients: Server; //all clients
  
  afterInit(server: Server) {
    this.server = server;
  }
  
  async handleConnection(client: Socket) {
    if (client.handshake.auth.token === '')
      return;
    const user = await this.jwtService.verify(
      client.handshake.auth.token, { secret: process.env.JWT_SECRET }
    );
      // if error maybe we need to recover or exit or something!!!
      
    // Oswin vraagt: waarom is id 'sub' ???
    // Ruben legt uit: .verify() returns a payload object, not a user object. This is also why sub contains the user id. As it is the Subject of the payload.
    const userId = user.sub;
    this.gate.addSocket(userId, client);
      
    // get all chats from the user here and add them to loadAllChats
    const userWithChats = await this.userService.userChats({id: userId});
    const chatsFromUser = userWithChats.rooms as Room[];
      
    // get public chats and add them to the list
    const publicChats = await this.roomService.getPublicRooms();
    const combinedChats = chatsFromUser.concat(publicChats);
      
    // send the loadAllChats socket-msg with the chats you are activel in!
    client.emit('loadAllChats', combinedChats);
    console.log(combinedChats);
  }
    
  handleDisconnect(client: Socket) {
    // removes this socket connection from the gate service when that socket goes offline
    this.gate.removeSocket(client);
  }
    
  // send update to all ppl in chat who are online
  // do we need to find out who is all online through gate service?
  spreadMessage(msg: MsgDto) {
    this.server.emit('receiveNewMsg', msg);
  }
    
    @SubscribeMessage('sendMsg')
  async handleMessage(client: Socket, packet: MsgDto) {
    // input protection
    if (packet.roomId === undefined || packet.body === undefined)
      return ;
    if (packet.invite === undefined)
      packet.invite = false;
  
    const userId = await this.gate.getUserBySocket(client);
  
    packet.authorId = userId;
  
    const msgWithAuthor = await this.msgService.handleIncomingMsg(packet);  // handles db placement of the new msg based on sender id
  
    // send the message to the connected participants in chat
    this.spreadMessage(msgWithAuthor);
  }
    
    @SubscribeMessage('loadRequest')
    async handleLoad(client: Socket, roomId: number) {
      // client verification
      const user = await this.gate.getUserBySocket(client);
      if (false === await this.chatService.isChatter(roomId, user))
        return ;  // maybe add error msg for frontend
      
      console.log('got loadrequest from: ', user);
      const users = await this.roomService.getRoomUsers(roomId);
      const chatHistory = await this.msgService.getChatHistory(roomId);
      const chatData = await this.roomService.getRoomById(roomId);
      client.emit('loadChatBase', {
        chat: chatData,
        users: users,
        history: chatHistory,
      });
    }

  @SubscribeMessage('deleteMsg')
    async handleDeleteMsg(client: Socket, payload: MsgDto) {
      const { roomId, id } = payload;
      // client extraction
      const userId = await this.gate.getUserBySocket(client);
      // verify that it is either an admin or the client self?
    
      if (await this.chatService.IsAdminOrOwner(roomId, userId) === false
      && await this.msgService.verifyAuthor(roomId, id, userId) === false
      )
        return ;
      
      // delete the message
      this.msgService.handleDeleteMsg(payload);
    }
}
