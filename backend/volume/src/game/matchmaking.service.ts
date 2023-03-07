import { GameService } from './game.service';
import { GameMode } from './game.service';

export class MatchmakingService {
  constructor (gameService: GameService) {
    this.gameService = gameService;
  }

  gameService: GameService;
  playerQueueNormal: number[] = [];
  playerQueueFreeMove: number[] = [];
  playerQueuePowerUp: number[] = [];
  playerQueueFiesta: number[] = [];

  addPlayerToQueue(mode: GameMode, userId: number) {
    if (mode === GameMode.NORMAL)
      this.playerQueueNormal.push(userId);
    else if (mode === GameMode.FREEMOVE)
      this.playerQueueFreeMove.push(userId);
    else if (mode === GameMode.POWERUP)
      this.playerQueuePowerUp.push(userId);
    else if (mode === GameMode.FIESTA)
      this.playerQueueFiesta.push(userId);
  }

  removePlayerFromQueue(userId: number) {
    if (this.checkAndRemoveFromArray(this.playerQueueNormal, userId))
      return;
    if (this.checkAndRemoveFromArray(this.playerQueueFreeMove, userId))
      return;
    if (this.checkAndRemoveFromArray(this.playerQueuePowerUp, userId))
      return;
    if (this.checkAndRemoveFromArray(this.playerQueueFiesta, userId))
      return;
  }

  private checkAndRemoveFromArray(arr: number[], userId: number) {
    const index = arr.indexOf(userId);

    if (index === -1)
      return false;
    arr.splice(index, 1);
    return true;
  }

  private checkAndMatchPlayers(arr: number[], mode: GameMode) {
    if (arr.length < 2)
      return;

    const player1 = arr.pop();
    const player2 = arr.pop();
    this.gameService.createGame(player1, player2, mode);

    // send info to players that game is created
  }

  checkForMatches() {
    this.checkAndMatchPlayers(this.playerQueueNormal, GameMode.NORMAL);
    this.checkAndMatchPlayers(this.playerQueueFreeMove, GameMode.FREEMOVE);
    this.checkAndMatchPlayers(this.playerQueuePowerUp, GameMode.POWERUP);
    this.checkAndMatchPlayers(this.playerQueueFiesta, GameMode.FIESTA);
  }
}
