import {
  ConnectedSocket,
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
import { User, Room } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards, Request } from '@nestjs/common';
import * as dotenv from 'dotenv';

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
  // private gateService: GateService;

  @WebSocketServer() all_clients: Server; //all clients
  
  @SubscribeMessage('sendMsg')
  async handleMessage(client: Socket, packet: MsgDto) {
    // input protection
    if (packet.roomId === undefined || packet.body === undefined)
      return ;
    if (packet.invite === undefined)
      packet.invite = false;

    const userId = await this.gate.getUserBySocket(client);

    packet.authorId = userId;

    console.log("msg : ", packet);

    const msg = await this.msgService.handleIncomingMsg(packet);  // handles db placement of the new msg based on sender id

    console.log(msg);
    // add functionality to send the message to the users in that chat who are online
    // temporarely send to everyone connected !!! not for end production
    this.spreadMessage(msg);
  }

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    if (client.handshake.auth.token === "")
      return;
    const user = await this.jwtService.verify(
      client.handshake.auth.token, { secret: process.env.JWT_SECRET }
    );
    // if error maybe we need to recover or exit or something!!!

    // waarom is id 'sub' ???
    const userId = user.sub;
    this.gate.addSocket(userId, client);

    // get all chats from the user here and add them to loadAllChats
    const userWithChats = await this.userService.UserChats({id: userId});
    const chatsFromUser = userWithChats.rooms as Room[];

    // get public chats and add them to the list
    const publicChats = await this.roomService.getPublicRooms();
    const combinedChats = chatsFromUser.concat(publicChats);

    // send the loadAllChats socket-msg with the chats you are activel in!
    client.emit('loadAllChats', combinedChats);
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

  @SubscribeMessage('loadRequest')
  async handleLoad(client: any, roomId: number) {
    // client verification
    const user = await this.gate.getUserBySocket(client);
    if (false === await this.chatService.isChatter(roomId, user))
      return ;  // maybe add error msg for frontend
    
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
  async createNewRoom(client: any, payload: roomDto) {
    // client extraction
    const userId = await this.gate.getUserBySocket(client);

    // force room-creating user to be owner
    payload.ownerId = userId;

    // use the roomService to create a new chatroom and return the room object
    return (this.roomService.createChat(payload));
  }

  @SubscribeMessage('destroyRoom')
  async destroyRoom(client: any, payload: number) {
    const roomId: number = payload;

    // client verification
    const userId = await this.gate.getUserBySocket(client);

    // is the sender is not the chat owner leave it intact adn return and error
    if (await this.chatService.isOwner(roomId, userId) == false)
      return ;  // add error return later

    // destroy with fire
    this.roomService.removeChat(roomId);
  }

  // check if this needs to be an invite according to pdf || think adding is enough
  @SubscribeMessage('addUserToRoom')
  async addUserToRoom(client: any, payload: any) {
    const {roomId, userId} = payload;

    // client verification
    const clientId = await this.gate.getUserBySocket(client);

    // only alow the chat owner and admins to add members to the chat
    if (await this.chatService.isOwner(roomId, clientId) == false && await this.chatService.isAdmin(roomId, clientId))
      return ;  // add error return later

    // add the user to the chat
    this.roomService.addToChat(userId, roomId);
  }

  @SubscribeMessage('makeUserAdmin')
  async makeUserAdmin(client: any, payload: any) {
    const {roomId, userId} = payload;

    // client verification
    const clientId = await this.gate.getUserBySocket(client);

    // is the sender is not the chat owner leave it intact and return and error
    if (await this.chatService.isOwner(roomId, clientId) == false)
      return ;  // add error return later

    // make the user admin in this chat
    this.roomService.makeAdmin(roomId, userId);
  }

  @SubscribeMessage('banUserFromRoom')
  async banUserFromRoom(client: any, payload: any) {
    const {roomId, banUserId} = payload;

    const clientId = await this.gate.getUserBySocket(client);

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.isOwner(roomId, clientId) == false && await this.chatService.isAdmin(roomId, clientId))
      return ;  // add error return later

    // add user to the banned list in this chat
    this.roomService.banUser(roomId, banUserId);
  }

  @SubscribeMessage('muteUserInRoom')
  async muteUserInRoom(client: any, payload: any) { // client verification? / extraction
    const {roomId, muteUserId} = payload;

    const clientId = await this.gate.getUserBySocket(client);

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.isOwner(roomId, clientId) == false && await this.chatService.isAdmin(roomId, clientId))
      return ;  // add error return later

    // add user to the banned list in this chat
    this.roomService.muteUser(roomId, muteUserId);
  }
}
