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
import { MsgDto, MsgService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private msgService: MsgService;

  @WebSocketServer() all_clients: Server; //all clients

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string) {
    console.log(`Server received msg: "${text}" from client: ${client.id}`);
    this.all_clients.emit('msgToClient', this.formatMessage('USER', text));
  }
  
  //     @SubscribeMessage('send')
  //   handleNewMessage(client: any, payload: MsgDto) { // client verification?
  //     console.log('Received payload:', payload);
  //     // extract message
  
  //     this.msgService.handleIncomingMsg(payload);
  //     // do i need a service for this?
  //     // check if the user is alowed to send it in the room
  //     // upload it to the database
  //   }

  afterInit(server: Server) {
	this.server = server;
	console.log('Gateway initialised.');
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.broadcast.emit('msgToClient', this.formatMessage('Rubot','A new user joined the chat.')); //all OTHER clients
    client.emit('msgToClient', this.formatMessage('Rubot','Welcome to the chat!')); //this client
    // console.warn(args + ' is unused');
    console.log(`Client ${client.id} connected`);

    args.forEach(element => {
      console.log('Arg passed to connection: ');
      console.log(element);
    });

    // const qs_import = 'query-string';
    // import (qs_import).then( (queryString) => {
    //   const { user_name, room_name } = queryString.parse(location.search, {
    //   // ignoreQueryPrefix: true
    //   });
    //   console.log(user_name, room_name);
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
    };
  }

}