import { Inject, Injectable } from '@nestjs/common';
import { GameMode } from 'src/game/game.definitions';
import { GameStatus } from 'src/game/status/game.status';
import { GateService } from 'src/gate/gate.service';

@Injectable()
export class StatusService {
  constructor(
    @Inject('statusGate') private readonly statusGate: GateService,
    @Inject('gameGate') private readonly gameGate: GateService,
    @Inject('chatGate') private readonly chatGate: GateService,
    @Inject('gameStatus') private readonly gameStatus: GameStatus,
    @Inject('matchmakingStatus') private readonly matchmakingStatus: GameStatus,
  ){}

  async getStatus(userId: number) {
    const chatSockets = this.chatGate.getSocketsByUser(userId);
    const statusSockets = this.statusGate.getSocketsByUser(userId);
    const gameMode: GameMode = this.gameStatus.getPlayerStatus(userId);
    const queueMode: GameMode = this.matchmakingStatus.getPlayerStatus(userId);
    if (gameMode !== undefined)
      return `Playing a ${gameMode} game`;
    if (queueMode !== undefined)
      return `In a queue for a ${queueMode} game`;
    if ((await chatSockets).length > 0)
      return 'Online';
    if ((await statusSockets).length > 0)
      return 'Online';
    return 'Offline';
  }

  // for testing purposes
  async listConnections() {
    console.log('gameGate connections: ');
    this.gameGate.printAllConnections();
    console.log('chatGate connections: ');
    this.chatGate.printAllConnections();
    console.log('statusGate connections: ');
    this.statusGate.printAllConnections();
  }
}
