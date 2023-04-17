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
    console.log(`Client connected to game: ${client.id}`);
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) { // remove players from queue/game?
    console.log(`Client disconnected inside game gateway: ${client.id}`);
  }

  @SubscribeMessage('CheckGameStatus')
  checkGameStatus(client: Socket, userId: number) {
    this.gameService.checkIfPlaying(userId, client);
  }

  @SubscribeMessage('ChangeGameTab')
  userChangedTabs(client: Socket, userId: number) {
    this.matchmakingService.removePlayerFromQueue(userId);
  }

  @SubscribeMessage('QueueForGame')
  handleMessage(client: Socket, payload: any) {
    console.log(`player: ${payload.userId} is queuing for gamemode: ${payload.gameMode}`);
    this.matchmakingService.addPlayerToQueue(payload.gameMode, payload.userId);
    // client = null; // linter
    // console.warn(`client ${client} unused`);
  }

  @SubscribeMessage('UpdateInput')
  handleKeyDown(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(payload.userId, payload.gameId, payload.key, payload.enabled); // input validation / auth
    // client = null; // linter
    // console.warn(`client ${client} unused`);
  }
}
