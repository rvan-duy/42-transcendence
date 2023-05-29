import { Inject, Injectable } from '@nestjs/common';
import { GateService } from 'src/gate/gate.service';

@Injectable()
export class StatusService {
  constructor(
    @Inject('statusGate') private readonly statusGate: GateService,
    @Inject('gameGate') private readonly gameGate: GateService,
    @Inject('chatGate') private readonly chatGate: GateService,
  ){}

  async getStatus(userId: number) {
    const gameSockets = this.gameGate.getSocketsByUser(userId);
    const chatSockets = this.chatGate.getSocketsByUser(userId);
    const statusSockets = this.statusGate.getSocketsByUser(userId);
    if ((await gameSockets).length > 0)
      return 'ingame';
    if ((await chatSockets).length > 0)
      return 'online';
    if ((await statusSockets).length > 0)
      return 'online';
    return 'offline';
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