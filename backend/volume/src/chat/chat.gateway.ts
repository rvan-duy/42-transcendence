import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as moment from 'moment';
import { MsgDto, MsgService } from '../msg/msg.service';
import { RoomService } from 'src/room/room.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private msgService: MsgService;
  private roomService: RoomService;
  
  @WebSocketServer() all_clients: Server; //all clients
  
  @SubscribeMessage('sendMsg')
  handleMessage(client: Socket, packet: any) {
      const user = packet.username;
      const text = packet.msg;
      console.log(`Server received msg: "${text}" from client: ${client.id} (${user})`);
      this.all_clients.emit('msgToClient', this.formatMessage(user, text));
      // this.msgService.handleIncomingMsg(payload);  // handles db placement of the new msg based on sender id
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
      time: new Date()
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
    // 
  }

  // room
  // create
  // remove?
  // invite
  // admin (make someone admin)
  
  // (channel) ban  (ban from channel == cannot rejoin without invite) (with timeout)
  // mute (player from channel) (with timeout)

  // creates a chat
  // @SubscribeMessage('create')
  // handleCreateChat(client: any, payload: RoomDto) { // client verification?

  //   // verify that it is either an admin or the client self?
  //   console.log('Received delete Request:', client);
  //   this.roomService.createChat(payload);
  // }
}
