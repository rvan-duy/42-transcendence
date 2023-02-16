import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class MyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() all_clients: Server; //all clients

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): WsResponse<string> {
    console.log(`Server received msg: "${text}" from client: ${client.id}`);
    return { event: 'msgToClient', data: text };
  }

  afterInit(server: Server) {
    console.warn(server + ' is unused');
    console.log('Gateway initialised.');
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.broadcast.emit('msgToClient', 'A new user joined the chat.'); //all OTHER clients
    client.emit('msgToClient', 'Welcome to the chat!'); //this client
    console.warn(args + ' is unused');
    console.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.all_clients.emit('msgToClient', 'A user left the chat.'); //all clients
    console.log(`Client ${client.id} disconnected`);
  }
}
