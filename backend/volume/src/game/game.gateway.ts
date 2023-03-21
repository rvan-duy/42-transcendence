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
  private gameMode: GameMode = GameMode.NORMAL;

  afterInit(server: Server) {
    this.server = server;
    this.gameService = new GameService(this.server);
    const fps: number = 60;
    this.gameService.createGame(1, 2, this.gameMode);
    setInterval(function() {this.gameService.updateGames();}.bind(this), 1000/fps);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('changeGameMode')
  handleMessage(client: Socket, packet: any) {
    console.log("yes");
    console.log(packet.gameMode);
    this.gameMode = packet.gameMode;
  }

  @SubscribeMessage('pos')
  handlePos(client:any, payload: any) {
    // console.log("yes");
    this.server.emit('pos', this.currGameState);  // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowDown')
  handleKeyDown(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.DOWN); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowUp')
  handleKeyUp(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.UP); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowLeft')
  handleKeyLeft(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.LEFT); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }
  @SubscribeMessage('ArrowRight')
  handleKeyRight(client: any, payload: any) {
    this.gameService.UpdatePlayerInput(1, PaddleInput.RIGHT); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

}
