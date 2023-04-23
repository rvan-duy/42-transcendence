import { Injectable } from '@nestjs/common';
import { GateService } from 'src/gate/gate.service';

@Injectable()
export class StatusService {
  constructor(
    private readonly gameGate: GateService,
    private readonly chatGate: GateService,
  ){}

  async getStatus(userId: number) {
    const gameSockets = this.gameGate.getSocketsByUser(userId);
    const chatSockets = this.chatGate.getSocketsByUser(userId);
    if ((await gameSockets).length > 0)
      return 'ingame';
    if ((await chatSockets).length > 0)
      return 'online';
    return 'offline';
  }
}