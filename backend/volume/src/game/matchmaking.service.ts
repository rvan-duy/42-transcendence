import { Inject, Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { GameMode, toGameMode, toPrismaGameMode } from './game.definitions';
import { MsgDto, MsgService } from 'src/msg/msg.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { Msg, User } from '@prisma/client';
import { Server } from 'socket.io';
import { GateService } from 'src/gate/gate.service';
import { Socket } from 'socket.io';
import { GameStatus } from './status/game.status';

enum Debug { // make sure to seed before
  ENABLED = 0,
}

class PrivateGameInvite {
  creatorId: number;
  mode: GameMode;
  room: number;
  timeCreated: number;
  inviteMsg: Msg;
}

const minTimeSinceLastGameInvite: number = 90000; // 1.5 minutes in milliseconds
const inviteExpirationTime: number = 300000; // 5 minutes in milliseconds

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
              @Inject('statusGate') private readonly statusGate: GateService,
              @Inject('matchmakingStatus') private readonly matchmakingStatus: GameStatus,
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
  whatQueueIsUserIn(userId: number) {
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

    if (Debug.ENABLED)
      console.log(`Adding user ${userId} to a queue`);
    if (mode === GameMode.NORMAL)
      this.queueNormal.push(userId);
    else if (mode === GameMode.FREEMOVE)
      this.queueFreeMove.push(userId);
    else if (mode === GameMode.POWERUP)
      this.queuePowerUp.push(userId);
    else if (mode === GameMode.FIESTA)
      this.queueFiesta.push(userId);
    this.matchmakingStatus.setPlayerStatus(userId, mode);
  }

  // removed the player from a queue if they are inside of one
  removePlayerFromQueue(userId: number) {
    if (Debug.ENABLED)
      console.log(`Removing user: ${userId} from the queue`);
    if (this.checkAndRemoveFromArray(this.queueNormal, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFreeMove, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queuePowerUp, userId))
      return;
    if (this.checkAndRemoveFromArray(this.queueFiesta, userId))
      return;
    this.matchmakingStatus.deletePlayerStatus(userId);
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
      const userId: number = arr.pop();
      this.removePlayerFromQueue(userId);
      this.gameService.createGame(userId, 2, mode);
      return ;
    }

    if (arr.length < 2)
      return;

    const player2 = arr.pop();
    const player1 = arr.pop();
    if (Debug.ENABLED)
      console.log(`Created a game of ${mode} with players ${player1} and ${player2}`);
    this.gameService.createGame(player1, player2, mode);
    this.matchmakingStatus.deletePlayerStatus(player1);
    this.matchmakingStatus.deletePlayerStatus(player2);
  }

  // checks all the queues if any games can be created
  checkForMatches() {
    if (Debug.ENABLED)
      console.log(`Checking for matches current players searching: normal ${this.queueNormal} freeMove ${this.queueFreeMove} powerUp ${this.queuePowerUp} fiesta: ${this.queueFiesta}`);
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

  private editPrivateGameInviteDatabase(editedMessage: Msg) {
    this.msgService.updateMessage(editedMessage.id, editedMessage.roomId, editedMessage.body, editedMessage.invite);
  }

  private editPrivateGameInviteFrontend(newMessage: Msg) {
    this.chatServer.emit('editMessage', newMessage);
  }

  private editOldMessage(oldMessage: Msg, newBody: string, isInvite: boolean) {
    const editedMessage: Msg = {
      id: oldMessage.id,
      roomId: oldMessage.roomId,
      body: newBody,
      authorId: oldMessage.authorId,
      invite: isInvite,
      timestamp: oldMessage.timestamp,
      mode: oldMessage.mode,
    };

    if (Debug.ENABLED)
      console.log(`Editing the old message: ${oldMessage} to ${editedMessage}`);
    this.editPrivateGameInviteFrontend(editedMessage);
    this.editPrivateGameInviteDatabase(editedMessage);
  }

  private expireOldInvite(inviteToExpire: PrivateGameInvite, indexOfInvite: number) {
    this.editOldMessage(inviteToExpire.inviteMsg, 'This invite has expired.', false);
    this.removePrivateGameInvite(indexOfInvite);
  }

  private checkOlderInvitesForExpiration(newInvite: PrivateGameInvite) {
    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];
      
      if (invite.creatorId === newInvite.creatorId && invite.room === newInvite.room) {
        if (Debug.ENABLED)
          console.log('expiring invite');
        this.expireOldInvite(invite, index);
        return ;
      }
    }
  }

  expireOldInvites() {
    const currentTime: number = new Date().getTime();
    if (Debug.ENABLED)
      console.log('checking for invite expirations');
    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];
      
      if (currentTime - invite.timeCreated > inviteExpirationTime)
        this.expireOldInvite(invite, index);
    }
  }

  async createPrivateGameInvite(creatorId: number, mode: GameMode, roomId: number) {
    const creator: User = await this.prismaUserService.user({ id: creatorId });
    const msgBody: string = `${creator.name} invited you to play a ${mode} game`;
    const newInvite: PrivateGameInvite = {
      creatorId: creator.id,
      mode: mode,
      room: roomId,
      timeCreated: new Date().getTime(),
      inviteMsg: undefined,
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

    const newInviteMessage: Msg = await this.msgService.handleIncomingMsg(inviteMsg);

    // Store the created message and check if there are any older invites to be expired
    newInvite.inviteMsg = newInviteMessage;
    this.checkOlderInvitesForExpiration(newInvite);
    this.privateGameInvites.push(newInvite);
    return (newInviteMessage);
  }

  removePrivateGameInvite(inviteIndex: number) {
    this.privateGameInvites.splice(inviteIndex, 1);
  }

  private async sendCreatorToGameTab(creatorId: number) {
    const sockets: Socket[] = await this.statusGate.getSocketsByUser(creatorId);

    for (let index = 0; index < sockets.length; index++) {
      const socket = sockets[index];
      
      socket.emit('switchToGameTab');
    }
  }

  // returns the invite status
  async acceptInvite(acceptingUserId: number, chatInviteMessage: Msg) {
    if (acceptingUserId === chatInviteMessage.authorId)
      return (InviteStatus.OwnInvite);
    if (this.gameService.whatGameIsUserIn(acceptingUserId) !== GameMode.NOTINGAME)
      return (InviteStatus.AlreadyInGame);
    if (this.gameService.whatGameIsUserIn(chatInviteMessage.authorId) !== GameMode.NOTINGAME)
      return (InviteStatus.CreatorAlreadyInGame);

    for (let index = 0; index < this.privateGameInvites.length; index++) {
      const invite = this.privateGameInvites[index];

      if (invite.creatorId === chatInviteMessage.authorId && invite.mode === toGameMode(chatInviteMessage.mode) && invite.room === chatInviteMessage.roomId)
      {
        this.matchmakingStatus.deletePlayerStatus(chatInviteMessage.authorId);
        this.matchmakingStatus.deletePlayerStatus(acceptingUserId);
        this.removePlayerFromQueue(chatInviteMessage.authorId);
        this.removePlayerFromQueue(acceptingUserId);
        this.removePrivateGameInvite(index);
        this.editOldMessage(chatInviteMessage, 'This invite has already been accepted', false);
        this.gameService.createGame(chatInviteMessage.authorId, acceptingUserId, toGameMode(chatInviteMessage.mode));
        await this.sendCreatorToGameTab(invite.creatorId);
        return (InviteStatus.InviteAccepted);
      }
    }
    return (InviteStatus.InviteNotFound);
  }
}
