import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Game } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { CurrentGameState, GameService } from './game.service';

enum GameMode {
  NORMAL = 'ModeNormal',
  FREEMOVE = 'ModeFreeMove',
  POWERUP = 'ModePowerUp',
  FIESTA = 'ModeFiesta',
}

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
  private server: Server;
  private gameService: GameService;
  private currGameState: CurrentGameState;

  afterInit(server: Server) {
    this.server = server;
    this.gameService = new GameService(this.server);
    this.gameService.createGame(1, 2, GameMode.NORMAL);
    const fps: number = 60;
    setInterval(function() {this.gameService.updateGames();}.bind(this), 1000/fps);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('pos')
  handlePos(client: any, payload: any) {
    this.server.emit('pos', this.currGameState);  // magic
  }

  @SubscribeMessage('ArrowDown')
  handleKeyDown(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.DOWN); // magic
  }

  @SubscribeMessage('ArrowUp')
  handleKeyUp(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.UP); // magic
  }

  @SubscribeMessage('ArrowLeft')
  handleKeyLeft(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.LEFT); // magic
  }
  @SubscribeMessage('ArrowRight')
  handleKeyRight(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.RIGHT); // magic
  }

}
