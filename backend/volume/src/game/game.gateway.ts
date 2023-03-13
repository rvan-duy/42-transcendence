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
  private players: number = 0;
  private player_clients: Array<string> = [];
  private id: number;

  afterInit(server: Server) {
    this.server = server;
    this.gameService = new GameService(this.server);
    const fps: number = 60;
    setInterval(function() {this.gameService.updateGames();}.bind(this), 1000/fps);
}

handleConnection(client: Socket) {
	console.log(`Client connected: ${client.id}`);
    client.emit('init'); // new connection
	this.players++;
	console.log(`Client connected: ${client}`);
	this.player_clients.push(client.id);
	if(this.players % 2 == 0)
		this.gameService.createGame(1, 2, GameMode.FREEMOVE);
  }

  handleDisconnect(client: Socket) {
	// TODO: Set game finished bool to true, make other player win.
    console.log(`Client disconnected: ${client.id}`);
	this.players--;
  }

  @SubscribeMessage('pos')
  handlePos(client: any, payload: any) {
    this.server.emit('pos', this.currGameState);  // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowDown')
  handleKeyDown(client: any, payload: any) {
	this.id = this.player_clients.indexOf(client.id) % 2 + 1;
	console.log(this.id);
	this.gameService.UpdatePlayerInput(this.id, PaddleInput.DOWN); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowUp')
  handleKeyUp(client: any, payload: any) {
	this.id = this.player_clients.indexOf(client.id) % 2 + 1;
    this.gameService.UpdatePlayerInput(this.id, PaddleInput.UP); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

  @SubscribeMessage('ArrowLeft')
  handleKeyLeft(client: any, payload: any) {
	this.id = this.player_clients.indexOf(client.id) % 2 + 1;
    this.gameService.UpdatePlayerInput(this.id, PaddleInput.LEFT); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }
  @SubscribeMessage('ArrowRight')
  handleKeyRight(client: any, payload: any) {
	this.id = this.player_clients.indexOf(client.id) % 2 + 1;
    this.gameService.UpdatePlayerInput(this.id, PaddleInput.RIGHT); // magic
    console.warn(`client ${client} and payload ${payload} unused`);
  }

}
