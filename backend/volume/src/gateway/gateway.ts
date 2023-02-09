// import { OnModuleInit } from "@nestjs/common";
// import { MessageBody } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class MyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() broadcast: Server;

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): WsResponse<string> {
    console.warn(client + ' is unused');
    // client.emit('msgToClient', text);
    // this.broadcast.emit('msgToClient', text);
    return { event: 'msgToClient', data: text};
  }

  // Implemented method overrides //
  afterInit(server: Server) {
    console.warn(server + ' is unused');
    console.log('Gateway initialised.');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.warn(args + ' is unused');
    console.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }
// //////////////////////////// //
}

// @WebSocketGateway(/*{  cors: true }*/)
// export class MyGateway implements OnModuleInit {
	
// 	@WebSocketServer()
// 	server: Server;

// 	onModuleInit(){
// 		this.server.on('connection', (socket) => {
// 			console.log(socket.id);
// 			console.log('Connected');
// 		});
// 	}

// 	@SubscribeMessage('newMessage')
// 	onNewMessage(@MessageBody() body: string){
// 		console.log(body);
// 		this.server.emit('onMessage', {
// 			msg: 'New Message',
// 			content: body,
// 		})
// 	}
// }

// @SubscribeMessage('events')
// handleEvent(
// 	@MessageBody() data: string,
// 	@ConnectedSocket() client: Socket,
// ): string {
// 	return data;
// }