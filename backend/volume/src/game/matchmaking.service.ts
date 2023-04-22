import { Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { GameMode } from './game.definitions';

enum Debug { // make sure to seed before
  ENABLED = 0,
}

class PrivateGameInvite {
  creatorId: number;
  mode: GameMode;
}

@Injectable()
export class MatchmakingService {
  constructor (private gameService: GameService) {
  }

  queueNormal: number[] = [];
  queueFreeMove: number[] = [];
  queuePowerUp: number[] = [];
  queueFiesta: number[] = [];
  privateGameInvites: PrivateGameInvite[] = [];

  addPlayerToQueue(mode: GameMode, userId: number) {
    this.removePlayerFromQueue(userId);

    if (mode === GameMode.NORMAL)
      this.queueNormal.push(userId);
    else if (mode === GameMode.FREEMOVE)
      this.queueFreeMove.push(userId);
    else if (mode === GameMode.POWERUP)
      this.queuePowerUp.push(userId);
    else if (mode === GameMode.FIESTA)
      this.queueFiesta.push(userId);
  }

  removePlayerFromQueue(userId: number) {
    if (this.checkAndRemoveFromArray(this.queueNormal, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFreeMove, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queuePowerUp, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFiesta, userId))
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
    if (Debug.ENABLED && arr.length === 1) {
      this.gameService.createGame(arr.pop(), 2, mode);
      return ;
    }

    if (arr.length < 2)
      return;

    const player2 = arr.pop();
    const player1 = arr.pop();
    console.log(`Created a game of ${mode} with players ${player1} and ${player2}`);
    this.gameService.createGame(player1, player2, mode);
  }

  checkForMatches() {
    // console.log(`Checking for matches current players searching: normal ${this.queueNormal} freeMove ${this.queueFreeMove} powerUp ${this.queuePowerUp} fiesta: ${this.queueFiesta}`);
    this.checkAndMatchPlayers(this.queueNormal, GameMode.NORMAL);
    this.checkAndMatchPlayers(this.queueFreeMove, GameMode.FREEMOVE);
    this.checkAndMatchPlayers(this.queuePowerUp, GameMode.POWERUP);
    this.checkAndMatchPlayers(this.queueFiesta, GameMode.FIESTA);
  }

  createPrivateGameInvite(creatorId: number, mode: GameMode) {
    // some logic stuff & things
    console.log(`${creatorId} created an invite to the gamemode ${mode}`);
    let newInvite: PrivateGameInvite;

    newInvite.creatorId = creatorId;
    newInvite.mode = mode;
    this.privateGameInvites.push(newInvite);
  }

  removePrivateGameInvite(inviteIndex: number) {

    // make sure to set the boolean inside all other chat invites to false
  
    this.privateGameInvites.splice(inviteIndex, 1);
  }

  // returns true if the invite was accepted successfully, else return false
  acceptInvite(acceptingUserId: number, creatorId: number, mode: GameMode) {
    console.log(`${acceptingUserId} accepted a game invite from ${creatorId}`);

    if (this.gameService.isUserInGame(acceptingUserId) || this.gameService.isUserInGame(creatorId))
      return (false);

    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];

      if (invite.creatorId === creatorId && invite.mode === mode)
      {
        this.removePlayerFromQueue(creatorId);
        this.removePlayerFromQueue(acceptingUserId);
        this.removePrivateGameInvite(index);
        this.gameService.createGame(creatorId, acceptingUserId, mode);
        return (true);
      }
    }
    return (false);
  }
}
