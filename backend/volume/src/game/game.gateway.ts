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

    const userId = user.sub;
    this.gate.addSocket(userId, client);
    this.gameService.joinUserToRoomIfPlaying(userId);
  }

  async handleDisconnect(client: Socket) {
    await this.disconnectUser(client);
    this.gate.removeSocket(client);
    client.rooms.forEach(room => {
      client.leave(room);
    });
  }

  @SubscribeMessage('CheckGameStatus')
  async checkGameStatus(client: Socket) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    this.gameService.checkIfPlaying(userId, client, this.matchmakingService);
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

  private async disconnectUser(client: Socket) {
    const userId: number = await this.gate.getUserBySocket(client);
    if (userId === undefined)
      return ;
    const sockets: Socket[] = await this.gate.getSocketsByUser(userId);
    
    // if multiple browsers are open a user can still have connections open to the backend and thus we shouldn't always remove them from the queue
    if (sockets.length === 1)
      this.matchmakingService.removePlayerFromQueue(userId);
    this.gameService.resetUserInput(userId);
    console.log(`${userId} has disconnected with socket ${client.id}`);
  }
}
