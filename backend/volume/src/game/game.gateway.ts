import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';
import { JwtService } from '@nestjs/jwt';
import { GameGateService } from './game.gate.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private gameService: GameService,
    private matchmakingService: MatchmakingService,
    private jwtService: JwtService,
    private gate: GameGateService,
  ){}

  private server: Server;

  afterInit(server: Server) {
    console.log('Created server inside game gateway');
    this.server = server;
    const fps: number = 1000 / 60; // 60 fps
    const updatesPerSecond: number = 1000 * 0.5; // half a second

    this.gameService.setSocket(this.server);
    setInterval(function() {this.matchmakingService.checkForMatches();}.bind(this), updatesPerSecond);
    setInterval(function() {this.gameService.updateGames();}.bind(this), fps);
  }

  async handleConnection(client: Socket) {
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
      console.log('Failed to Authenticate user');
      return ;
    }

    console.log(`Auth worked, user: ${user}`);
    const userId = user.sub;
    this.gate.addSocket(userId, client);
	this.gameService.joinUserToRoomIfPlaying(userId);
    console.log(`Client connected to game: ${client.id} user id ${userId}`);
  }

  async handleDisconnect(client: Socket) {
    const userId: number = await this.gate.getUserBySocket(client);
    this.matchmakingService.removePlayerFromQueue(userId);
	this.gameService.removeUserFromGameRoom(userId, client);
    this.gate.removeSocket(client);
    console.log(`Client disconnected inside game gateway: ${client.id}`);
  }

  @SubscribeMessage('CheckGameStatus')
  async checkGameStatus(client: Socket) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    this.gameService.checkIfPlaying(userId, client);
  }

  @SubscribeMessage('ChangeGameTab')
  async userChangedTabs(client: Socket) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    console.log(`user ${userId} changed tabs`);
    this.matchmakingService.removePlayerFromQueue(userId);
  }

  @SubscribeMessage('QueueForGame')
  async handleQueue(client: Socket, payload: any) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    console.log(`player: ${userId} is queuing for gamemode: ${payload.gameMode}`);
    this.matchmakingService.addPlayerToQueue(payload.gameMode, userId);
  }

  @SubscribeMessage('UpdateInput')
  async handleKeyDown(client: any, payload: any) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    this.gameService.UpdatePlayerInput(userId, payload.gameId, payload.key, payload.enabled);
  }
}
