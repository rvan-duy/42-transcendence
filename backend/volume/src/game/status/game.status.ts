import { Injectable } from "@nestjs/common";
import { GameMode } from "src/game/game.definitions";

@Injectable()
export class  GameStatus {
  constructor() {}

  private	data = new Map <number, GameMode>();

    deletePlayerStatus(userId: number) {
      this.data.delete(userId);
    }

   setPlayerStatus(userId: number, mode: GameMode) {
      this.data.set(userId, mode);
   }

   getPlayerStatus(userId: number) {
    const status: GameMode = this.data.get(userId);

    return (status);
   }
}
