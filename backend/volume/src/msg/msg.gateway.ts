import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MsgDto, MsgService } from './msg.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat'
})
export class MsgGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private msgService: MsgService;

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('init'); // data, all chats
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  addMessage(msg: MsgDto) {
    this.server.emit('add', msg);
  }

  @SubscribeMessage('load')
  handleLoad(client: any, roomId: number) { // client verification?
    console.log('/chat/load received roomId:', roomId);

    const data = this.msgService.getChatHistory(roomId);
    client.emit('load', data);
  }

  @SubscribeMessage('send')
  handleNewMsg(client: any, payload: MsgDto) { // client verification?
    console.log('Received payload:', payload);

    this.msgService.handleIncomingMsg(payload);
  }

  @SubscribeMessage('delete')
  handleDeleteMsg(client: any, payload: MsgDto) { // client verification?

    // verify that it is either an admin or the client self?
    console.log('Received delete Request:', payload);
    this.msgService.handleDeleteMsg(payload);
  }
}
