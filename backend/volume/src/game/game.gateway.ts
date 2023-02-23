import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Game } from '@prisma/client';
import { Socket, Server } from 'socket.io';

enum GameMode {
  SURVIVAL = 'Survival',
  CREATIVE = 'Creative',
  ADVENTURE = 'Adventure',
  SPECTATOR = 'Spectator',
}

class Player {
  userId: number;
  batXY: number[];
  score: number;
  acceleration: number;
}

// const ball: {x: number, y: number, speed: number, Xvelocity: number, Yvelocity: number, rad: number} = {
//   x: canvas.width/2,
//   y: canvas.height/2,
//   speed: 5,
//   Xvelocity: 5,
//   Yvelocity: 5,
//   rad: 20,
// }

// const plat: {x: number, y: number, height: number, width: number, score:number} = {
//   x: canvas.width - 20,
//   y: canvas.height / 2 - 25,
//   height: 100,
//   width: 20,
//   score: 0
// }

// const other: {x: number, y: number, height: number, width: number, score:number} = {
//   x: 0,
//   y : canvas.height / 2 - 25,
//   height: 100,
//   width: 20,
//   score: 0
// }

class GameData {
  ball: number[] = [500, 300];
  paddle1:  number[] = [0, 275];
  paddle2:  number[] = [980, 275];
  score:    number[] = [0, 0];
  constructor() {
    this.ball = [500, 300];
    this.paddle1 = [0, 275];
    this.paddle2 = [980, 275];
    this.score = [0, 0];
  }
}

class Games {
  player: Player[];
  watchers: number[];
  mapsize: number[];
  mode: GameMode;
  texturePath: string;
  data: GameData;
  constructor() {
    this.data = new GameData();
    this.texturePath = 'undefined';
    this.mode = GameMode.SURVIVAL;
}
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private games:  Games[] = [];

  afterInit(server: Server) {
    this.server = server;
    this.games.push(new Games());
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('pos', this.games[0].data);  // magic
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('up')
  handleUp(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

  @SubscribeMessage('pos')
  handlePos(client: any, payload: any) {
    console.log('Received payload:', payload);
    this.server.emit('pos', this.games[2].data);  // magic
  }

  @SubscribeMessage('down')
  handleDown(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

}
