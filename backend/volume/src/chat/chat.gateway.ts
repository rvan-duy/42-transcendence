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
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';
import { MatchmakingService } from 'src/game/matchmaking.service';
import { InviteStatus } from 'src/game/matchmaking.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('chatGate') private readonly chatGate: GateService,
    private msgService: MsgService,
    private roomService: RoomService,
    private chatService: ChatService,
    private jwtService: JwtService,
    private matchmakingService: MatchmakingService,
  ){}
  private server: Server;

  @WebSocketServer() all_clients: Server; //all clients
  
  afterInit(server: Server) {
    this.server = server;
  }
  
  async handleConnection(client: Socket) {
    if (client.handshake.auth.token === '')
      return;
    let user;
    try {
      user = await this.jwtService.verify(
        client.handshake.auth.token, { secret: process.env.JWT_SECRET }
      );
    } catch(err) {
      // disconnect the unauthenticated client and return to skip adding socket as a user
      client.disconnect();
      return ;
    }

    // link this socket to the user
    const userId = user.sub;
    this.chatGate.addSocket(userId, client);
  }
    
  handleDisconnect(client: Socket) {
    // unlink this socket from user
    this.chatGate.removeSocket(client);

    // remove client from all the rooms its in
    client.rooms.forEach(room => {
      client.leave(room);
    });
  }
    
  // send update to all ppl in chat who are online
  // keeping track of people in the room with socketio rooms
  spreadMessage(msg: MsgDto, room: string) {
    this.server.to(room).emit('receiveNewMsg', msg);
  }
    
  @SubscribeMessage('sendInvite')
  async handleGameInvite(client: Socket, packet: any) { //roomId: number, mode: GameMode
    console.log(`packet recieved: ${packet.mode} ${packet.roomId}`);
    if (packet.roomId === undefined)
      return ;
    const userId = await this.chatGate.getUserBySocket(client);
    if (await this.chatService.isChatter(packet.roomId, userId) === false)
      return ;

    console.log(`userId of given user: ${userId}`);
    const msgWithAuthor = await this.matchmakingService.createPrivateGameInvite(userId, packet.mode, packet.roomId);

    // send the message to the connected participants in chat
    this.spreadMessage(msgWithAuthor, String(packet.roomId));
  }

  @SubscribeMessage('acceptInvite')
  async handleAcceptGameInvite(client: Socket, packet: any) { //roomId: number, mode: GameMode, creatorId: number
    if (packet.roomId === undefined || packet.creatorId === undefined || packet.mode === undefined) {
      client.emit('inviteStatus', InviteStatus.InvalidPacket);
      return ;
    }
    const userId = await this.chatGate.getUserBySocket(client);
    if (await this.chatService.isChatter(packet.roomId, userId) === false) {
      client.emit('inviteStatus', InviteStatus.NotInRoom);
      return ;
    }
    if (await this.chatService.mutedCheck(userId, packet.roomId, client) === true) {
      client.emit('inviteStatus', InviteStatus.Muted);
      return ;
    }

    const inviteStatus = await this.matchmakingService.acceptInvite(userId, packet.creatorId, packet.mode, packet.roomId, this.server);
    client.emit('inviteStatus', inviteStatus);
  }

  @SubscribeMessage('sendMsg')
  async handleMessage(client: Socket, packet: MsgDto) {
    // input protection
    if (packet.roomId === undefined || packet.body === undefined)
      return ;
    if (packet.invite === undefined)
      packet.invite = false;

    // retrieve the userId of sender and check if they are in the given room
    const userId = await this.chatGate.getUserBySocket(client);
    if (await this.chatService.isChatter(packet.roomId, userId) === false)
      return ;

    // if muted in channel emit a temp mess to sender that they are muted and return
    if (await this.chatService.mutedCheck(userId, packet.roomId, client) === true)
      return ;
  
    // force sender to be author
    packet.authorId = userId;
  
    // handles db placement of the new msg based on sender id
    // does require an update for is room real check
    const msgWithAuthor = await this.msgService.handleIncomingMsg(packet);

    // send the message to the connected participants in chat
    this.spreadMessage(msgWithAuthor, String(packet.roomId));
  }
    
  // add to group here
  @SubscribeMessage('loadRequest')
  async handleLoad(client: Socket, roomId: number) {
    // input protection
    if (typeof roomId !== 'number') {
      throw new Error('roomId must be a number');
    }

    // client verification
    const user = await this.chatGate.getUserBySocket(client);
    if (false === await this.chatService.isChatter(roomId, user))
      throw new Error('no access or invalid roomId'); // also catches non existing rooms
    
    // wait for all the items for current chat
    const [users, chatHistory, chatData] = await Promise.all([
      this.roomService.getRoomUsers(roomId),
      this.msgService.getChatHistory(roomId),
      this.roomService.getRoomById(roomId),
    ]);
    
    // add client to the socketio room based on roomId
    client.join(String(roomId));

    // send the complete chat info to client
    client.emit('loadChatBase', {
      chat: chatData,
      users: users,
      history: chatHistory,
    });
  }

  @SubscribeMessage('deleteMsg')
  async handleDeleteMsg(client: Socket, payload: MsgDto) {
    const { roomId, id } = payload;
    if (roomId === undefined || id === undefined)
      throw Error('incomplete payload');

    // client extraction
    const userId = await this.chatGate.getUserBySocket(client);
  
    // verify that it is either an admin or the client self?
    if (await this.chatService.isAdminOrOwner(roomId, userId) === false
    && await this.msgService.verifyAuthor(roomId, id, userId) === false
    )
      throw Error('not allowed');
    
    // delete the message
    this.msgService.handleDeleteMsg(payload);
  }
}
