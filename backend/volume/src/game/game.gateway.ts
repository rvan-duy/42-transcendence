import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Game } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';

enum PaddleInput {
  UP = 'KeyUp',
  DOWN = 'KeyDown',
  LEFT = 'KeyLeft',
  RIGHT = 'KeyRight',
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (private gameService: GameService, private matchmakingService: MatchmakingService) {
  }

  private server: Server;
  //   private currGameState: CurrentGameState;

  afterInit(server: Server) {
    console.log('Created server inside game gateway');
    this.server = server;
    const fps: number = 1000 / 60; // 60 fps
    const updatesPerSeconds: number = 1000 * 0.5; // half a second

    this.gameService.setSocket(this.server);
    setInterval(function() {this.matchmakingService.checkForMatches();}.bind(this), updatesPerSeconds);
    setInterval(function() {this.gameService.updateGames();}.bind(this), fps);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) { // remove players from queue/game?
    console.log(`Client disconnected inside game gateway: ${client.id}`);
  }

  @SubscribeMessage('QueueForGame')
  handleMessage(client: Socket, payload: any) {
    console.log(`player: ${payload.userId} is queuing for gamemode: ${payload.gameMode}`);
    this.matchmakingService.addPlayerToQueue(payload.gameMode, payload.userId);
    console.warn(`client ${client} unused`);
  }

  //   @SubscribeMessage('pos')
  //   handlePos(client:any, payload: any) {
  //     // console.log("yes");
  //     this.server.emit('pos', this.currGameState);
  //     console.warn(`client ${client} and payload ${payload} unused`);
  //   }

  @SubscribeMessage('ArrowDown')
  handleKeyDown(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(payload.userId, PaddleInput.DOWN); // input validation / auth
    console.warn(`client ${client} unused`);
  }

  @SubscribeMessage('ArrowUp')
  handleKeyUp(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(payload.userId, PaddleInput.UP); // input validation / auth
    console.warn(`client ${client} unused`);
  }

  @SubscribeMessage('ArrowLeft')
  handleKeyLeft(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(payload.userId, PaddleInput.LEFT); // input validation / auth
    console.warn(`client ${client} unused`);
  }

  @SubscribeMessage('ArrowRight')
  handleKeyRight(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(payload.userId, PaddleInput.RIGHT); // input validation / auth
    console.warn(`client ${client} unused`);
  }
}
