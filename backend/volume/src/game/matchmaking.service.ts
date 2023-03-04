import { GameService } from "./game.service";
import { GameMode } from "./game.service";

class QueuedUser {
  constructor (mode: GameMode, userId: number) {
    this.mode = mode;
    this.userId = userId;
  }
  mode: GameMode;
  userId: number;
}

export class MatchmakingService {
  playerQueue: QueuedUser[];

  addPlayerToQueue(mode: GameMode, userId: number) {
    const newplayer = new QueuedUser(mode, userId);

    this.playerQueue.push(newplayer);
  }

  removePlayerFromQueue(userId: number) {
    for (let index = 0; index < this.playerQueue.length; index++) {
      const player = this.playerQueue[index];
      
      if (player.userId === userId) {
        this.playerQueue.splice(index, 1);
        return;
      }
    }
  }

  checkForMatch() {
    if (this.playerQueue.length < 2)
      return;

    for (let index = 0; index < this.playerQueue.length; index++) {
      const player = this.playerQueue[index];
      
    }
  }
}