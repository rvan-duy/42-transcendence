import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as moment from 'moment';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class MyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() all_clients: Server; //all clients

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string) {
    console.log(`Server received msg: "${text}" from client: ${client.id}`);
	this.all_clients.emit('msgToClient', this.formatMessage('USER', text));
  }

  afterInit(server: Server) {
    console.warn(server + ' is unused');
    console.log('Gateway initialised.');
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.broadcast.emit('msgToClient', this.formatMessage('Rubot','A new user joined the chat.')); //all OTHER clients
    client.emit('msgToClient', this.formatMessage('Rubot','Welcome to the chat!')); //this client
    // console.warn(args + ' is unused');
    console.log(`Client ${client.id} connected`);

	args.forEach(element => {
		console.log('Arg passed to connection: ');
		console.log(element)
	});

	// const qs_import = 'query-string';
	// import (qs_import).then( (queryString) => {
	// 	const { user_name, room_name } = queryString.parse(location.search, {
	// 	// ignoreQueryPrefix: true
	// 	});
	// 	console.log(user_name, room_name);
	// });
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
		time: moment().format('HH:mm ZZ') //TODO: Make not GMT maybe?
	}
  }

// import { OnModuleInit } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
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
		// client.emit('msgToClient', text);
		// this.broadcast.emit('msgToClient', text);
		return { event: 'msgToClient', data: text};
	}
	
	// Implemented method overrides //
	afterInit(server: Server) {
		console.log("Gateway initialised.")
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client ${client.id} connected`);
	}
	
	handleDisconnect(client: Socket) {
		console.log(`Client ${client.id} disconnected`);
	}
	// //////////////////////////// //
}
// import { OnModuleInit } from "@nestjs/common";
// import { MessageBody } from '@nestjs/websockets';
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
