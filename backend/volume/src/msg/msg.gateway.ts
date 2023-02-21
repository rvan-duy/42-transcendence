import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MsgService } from './msg.service';

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
    client.emit('init'); // , data (all chats?)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send')
  handleNewMessage(client: any, payload: MsgDto) { // client verification?
    console.log('Received payload:', payload);
    // extract message

    this.msgService.handleIncomingMsg(payload);
    // do i need a service for this?
    // check if the user is alowed to send it in the room
    // upload it to the database
  }
}
