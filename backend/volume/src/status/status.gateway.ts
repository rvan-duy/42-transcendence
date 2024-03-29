import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { GateService } from 'src/gate/gate.service';

enum Debug {
  ENABLED = 0
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/status'
})
export class StatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    @Inject('statusGate') private gate: GateService,
    private jwtService: JwtService,
  ){}
    
  private server: Server;
    
  afterInit(server: Server) {
    if (Debug.ENABLED)
      console.log('Created server inside status gateway');
    this.server = server;
  }

  async handleConnection(client: Socket) {
    if (Debug.ENABLED)
      console.log(`Client: ${client.id} trying to connect with backend`);
    if (client.handshake.auth.token === '')
      return;
    let user;
    try {
      user = await this.jwtService.verify(
        client.handshake.auth.token, { secret: process.env.JWT_SECRET }
      );
    } catch(err) {
      client.emit('FailedToAuthenticate');
      client.disconnect();
      if (Debug.ENABLED) {
        console.log('Failed to Authenticate user. Error: ');
        console.log(err);
      }
      return ;
    }

    if (Debug.ENABLED)
      console.log(`added client: ${client.id} to status service`);
    this.gate.addSocket(user.sub, client);
  }

  handleDisconnect(client: Socket) {
    this.gate.removeSocket(client);
  }
}
