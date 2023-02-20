import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Game } from '@prisma/client';
import { Socket, Server } from 'socket.io';

enum GameMode {
  SURVIVAL = "Survival",
  CREATIVE = "Creative",
  ADVENTURE = "Adventure",
  SPECTATOR = "Spectator",
}


class Player {
  userId: number;
  batXY: number[];
  score: number;
  acceleration: number;
}

class Games {
  player: Player[];
  watchers: number[];
  mapsize: number[];
  mode: GameMode;
  texturePath: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private games: Games[];

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('init') // new connection
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('up')
  handleUp(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

  @SubscribeMessage('down')
  handleDown(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

}
