import { Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { GameMode, toGameMode, toPrismaGameMode } from './game.definitions';
import { MsgDto, MsgService } from 'src/msg/msg.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { User } from '@prisma/client';
import { Server } from 'socket.io';

enum Debug { // make sure to seed before
  ENABLED = 0,
}

class PrivateGameInvite {
  creatorId: number;
  mode: GameMode;
  room: number;
  timeCreated: number;
}

const minTimeSinceLastGameInvite: number = 90000; // in milliseconds

export enum InviteStatus {
    NotInRoom = 'You do not have access to the room you have provided',
    AlreadyInGame = 'You are already playing an ongoing game',
    CreatorAlreadyInGame = 'The creator is currently in an ongoing game',
    InviteAccepted = 'You have accepted the invite',
    InviteNotFound = 'Unable to find the invite you are trying to accept',
    InvalidPacket = 'You have sent an invalid packet to the server',
    Muted = 'You are muted in the provided room',
    OwnInvite = 'You cannot accept your own invite',
  }

@Injectable()
export class MatchmakingService {
  constructor (
              private readonly gameService: GameService,
              private readonly msgService: MsgService,
              private readonly prismaUserService: PrismaUserService,
  ) {
  }

  queueNormal: number[] = [];
  queueFreeMove: number[] = [];
  queuePowerUp: number[] = [];
  queueFiesta: number[] = [];
  privateGameInvites: PrivateGameInvite[] = [];

  chatServer: Server;

  setChatServer(chatServer: Server) {
    this.chatServer = chatServer;
  }

  // returns the queue the user is in or NotQueued
  isUserQueued(userId: number) {
    if (this.queueNormal.indexOf(userId) !== -1)
      return (GameMode.NORMAL);
    if (this.queueFreeMove.indexOf(userId) !== -1)
      return (GameMode.FREEMOVE);
    if (this.queuePowerUp.indexOf(userId) !== -1)
      return (GameMode.POWERUP);
    if (this.queueFiesta.indexOf(userId) !== -1)
      return (GameMode.FIESTA);
    return (GameMode.NOTQUEUED);
  }

  // first removes the user from any queue they are already inside of and then adds them to a new queue
  addPlayerToQueue(mode: GameMode, userId: number) {
    this.removePlayerFromQueue(userId);

    console.log(`Adding user ${userId} to a queue`);
    if (mode === GameMode.NORMAL)
      this.queueNormal.push(userId);
    else if (mode === GameMode.FREEMOVE)
      this.queueFreeMove.push(userId);
    else if (mode === GameMode.POWERUP)
      this.queuePowerUp.push(userId);
    else if (mode === GameMode.FIESTA)
      this.queueFiesta.push(userId);
  }

  // removed the player from a queue if they are inside of one
  removePlayerFromQueue(userId: number) {
    console.log(`Removing user: ${userId} from the queue`);
    if (this.checkAndRemoveFromArray(this.queueNormal, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFreeMove, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queuePowerUp, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFiesta, userId))
      return;
  }

  // checks if a userId is found inside of an array and then removed it
  private checkAndRemoveFromArray(arr: number[], userId: number) {
    const index = arr.indexOf(userId);

    if (index === -1)
      return false;
    arr.splice(index, 1);
    return true;
  }

  // checks if there are enough players in a queue, creates a game with 2 players if they are found
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

  // checks all the queues if any games can be created
  checkForMatches() {
    // console.log(`Checking for matches current players searching: normal ${this.queueNormal} freeMove ${this.queueFreeMove} powerUp ${this.queuePowerUp} fiesta: ${this.queueFiesta}`);
    this.checkAndMatchPlayers(this.queueNormal, GameMode.NORMAL);
    this.checkAndMatchPlayers(this.queueFreeMove, GameMode.FREEMOVE);
    this.checkAndMatchPlayers(this.queuePowerUp, GameMode.POWERUP);
    this.checkAndMatchPlayers(this.queueFiesta, GameMode.FIESTA);
  }

  private inviteAlreadyExists(newInvite: PrivateGameInvite) {
    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];

      if (newInvite.creatorId === invite.creatorId &&
          newInvite.mode === invite.mode &&
          newInvite.room === invite.room &&
          newInvite.timeCreated - invite.timeCreated < minTimeSinceLastGameInvite)
        return (true);
    }
    return (false);
  }

  async createPrivateGameInvite(creatorId: number, mode: GameMode, roomId: number) {
    const creator: User = await this.prismaUserService.user({ id: creatorId });
    const msgBody: string = `${creator.name} invited you to play a ${mode} game`;
    console.log(msgBody);
    const newInvite: PrivateGameInvite = {
      creatorId: creator.id,
      mode: mode,
      room: roomId,
      timeCreated: new Date().getTime(),
    };
    const inviteMsg: MsgDto = {
      id: 0,
      roomId: roomId,
      body: msgBody,
      authorId: creator.id,
      invite: true,
      mode: toPrismaGameMode(mode),
    };

    // prevents a user from spamming a chat with game invites
    if (this.inviteAlreadyExists(newInvite))
      return (undefined);

    this.privateGameInvites.push(newInvite);
    return (await this.msgService.handleIncomingMsg(inviteMsg));
  }

  removePrivateGameInvite(inviteIndex: number, inviteMessage: MsgDto) {
    this.chatServer.to(String(inviteMessage.roomId)).emit('disableInvite', this.privateGameInvites[inviteIndex]);
    this.privateGameInvites.splice(inviteIndex, 1);
    this.msgService.updateInvite(inviteMessage.id, inviteMessage.roomId, 'This invite has already been accepted');
  }

  // returns true if the invite was accepted successfully, else return false
  acceptInvite(acceptingUserId: number, inviteMessage: MsgDto) {
    console.log(`${acceptingUserId} accepted a game invite from ${inviteMessage.authorId}`);

    if (acceptingUserId === inviteMessage.authorId)
      return (InviteStatus.OwnInvite);
    if (this.gameService.isUserInGame(acceptingUserId))
      return (InviteStatus.AlreadyInGame);
    if (this.gameService.isUserInGame(inviteMessage.authorId))
      return (InviteStatus.CreatorAlreadyInGame);

    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];

      if (invite.creatorId === inviteMessage.authorId && invite.mode === toGameMode(inviteMessage.mode) && invite.room === inviteMessage.roomId)
      {
        this.removePlayerFromQueue(inviteMessage.authorId);
        this.removePlayerFromQueue(acceptingUserId);
        this.removePrivateGameInvite(index, inviteMessage);
        this.gameService.createGame(inviteMessage.authorId, acceptingUserId, toGameMode(inviteMessage.mode));
        return (InviteStatus.InviteAccepted);
      }
    }
    return (InviteStatus.InviteNotFound);
  }
}
