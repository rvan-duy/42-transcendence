import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Room, Access } from '@prisma/client';
import { PrismaRoomService } from 'src/room/prisma/prismaRoom.service';
import { CryptService } from 'src/crypt/crypt.service';
import { RoomService, roomDto } from 'src/room/room.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly prismaRoomService: PrismaRoomService,
    private readonly roomService: RoomService,
    private readonly cryptService: CryptService,
    private readonly chatService: ChatService,
    private readonly userService: PrismaUserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('createRoom')
  async handleCreateRoom(
    @Request() req: any,
    @Query('name') roomName: string,
    @Query('access') access: Access = Access.PUBLIC,
    @Query('password') password: string = undefined,
  ) {
    if (password === undefined && access === Access.PROTECTED)
      throw new HttpException('password left undefined for protected chat', HttpStatus.BAD_REQUEST);

    const userId = req.user.id;
    const newRoom: roomDto = {
      name: roomName,
      ownerId: userId,
      access: access,
      password: password,
    };
    return await this.roomService.createChat(newRoom);
  }

  @UseGuards(JwtAuthGuard)
  @Post('joinRoom')
  async handleJoinRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('password') password: string,
  ) {
    const userId = req.user.id;
    roomId = Number(roomId);
    const room = await this.prismaRoomService.Room({id: roomId});
    switch (room?.access || 'invalid') {
    case Access.PRIVATE:
      return ; // you need to be added to this chat
    case Access.PROTECTED:
      if (await this.cryptService.comparePassword(password, room.hashedCode) === false) {
        throw new ForbiddenException('Incorrect password');
      }
      this.roomService.addToChat(userId, roomId);
      return ;
    case Access.PUBLIC:
      return ; // not added to public rooms since everyone is part unless kicked / blocked
    case 'invalid':
      throw new NotFoundException('Room not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('myRooms')
  async getMyRooms(
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      const userWithChats = await this.userService.userChats({id: userId});
      const chatsFromUser = userWithChats.rooms as Room[];
      
      // get public chats and add them to the list
      const availableChats = await this.roomService.getPublicAndProtectedRooms(Number(userId));
      // console.log(publicChats);
      // console.log('userschats: ', chatsFromUser);
      // const combinedChats = chatsFromUser.concat(publicChats);

      // return all available chat for users to sender
      return {myRooms: chatsFromUser, available: availableChats};
    } catch {
      throw new InternalServerErrorException('Failed to fetch Rooms');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('directMsg')
  async getDM(
    @Request() req: any,
    @Query('friendId') friendId: number,
  ) {
    friendId = Number(friendId);
    const clientId = req.user.id;

    // TODO: check if is blocked

    // get and return the dm
    const room = await this.roomService.getDirectMsg(clientId, friendId);
    return room;
  }

  @UseGuards(JwtAuthGuard)
  @Get('roomUsers')
  async getUsersInRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);
    if (false === await this.chatService.isChatter(roomId, clientId))
      throw new Error('no access or invalid roomId'); // also catches non existing rooms

    const roomIncludingUsers = await this.roomService.getRoomUsers(roomId);
    return roomIncludingUsers.users;

  }

  @UseGuards(JwtAuthGuard)
  @Get('roomAdmins')
  async getRoomAdmins(
    @Request() req: any,
    @Query('roomId') roomId: number,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);

    if (false === await this.chatService.isChatter(roomId, clientId))
      throw new Error('no access or invalid roomId'); // also catches non existing rooms

    try {
      const roomIncludingAdmins = await this.roomService.getRoomAdmins(roomId);
      return roomIncludingAdmins.admin;
    } catch {
      throw new InternalServerErrorException('Failed to fetch admins for room');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('destroyRoom')
  async destroyRoom(
        @Request() req: any,
        @Query('roomId') roomId: number,
  ) {
    const userId = req.user.id;
    roomId = Number(roomId);
    // is the sender is not the chat owner leave it intact and return and error
    if (await this.chatService.isOwner(roomId, userId) === false) // also catches non existing rooms
      throw new ForbiddenException('Only chat owner is alowed to destroy room');

    // destroy with fire
    this.roomService.removeChat(roomId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('makeUserAdmin')
  async makeUserAdmin(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('userId') userId: number,
  ) {
    const clientId = req.user.id;
    userId = Number(userId);
    roomId = Number(roomId);
    // is the sender is not the chat owner leave it intact and return and error
    if (await this.chatService.isOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner is alowed to promote to admin');

    // make the user admin in this chat
    this.roomService.makeAdmin(roomId, userId);
  }

  // check if this needs to be an invite according to pdf || think adding is enough
  @UseGuards(JwtAuthGuard)
  @Post('addUserToRoom')
  async addUserToRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('userToAdd') userId: number,
  ) {
    const clientId = req.user.id;
    userId = Number(userId);
    roomId = Number(roomId);
    // only alow the chat owner and admins to add members to the chat
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to add users to chat');

    // add the user to the chat
    this.roomService.addToChat(userId, roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('banUserFromRoom')
  async banUserFromRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('banUserId') banUserId: number,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);
    banUserId = Number(banUserId);

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to ban users from chat');

    // check if the banned user is not the owner
    if (await this.chatService.isOwner(roomId, banUserId) === true)
      throw new ForbiddenException('The chat owner cannot be banned');

    // add user to the banned list in this chat
    this.roomService.banUser(roomId, banUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('muteUserInRoom')
  async muteUserInRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('muteUserId') muteUserId: number,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);
    muteUserId = Number(muteUserId);

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to mute users from chat');

    // check if the muted user is not the owner
    if (await this.chatService.isOwner(roomId, muteUserId) === true)
      throw new ForbiddenException('The chat owner cannot be muted');

    // add user to the muted list in this chat
    const resp = await this.roomService.muteUser(roomId, muteUserId);
    if (resp === undefined)
      throw new NotFoundException('room not found');
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Post('kickUserFromRoom')
  async kickUserFromRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('kickUserId') kickUserId: number,
  ) {
    const clientId = req.user.id;
    console.log('new', roomId, kickUserId);
    roomId = Number(roomId);
    kickUserId = Number(kickUserId);

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to kick users from chat');

    // check if the kicked user is not the owner or admin
    if (await this.chatService.isAdminOrOwner(roomId, kickUserId) === true)
      throw new ForbiddenException('The chat owner cannot be kicked');

    // remove the kicked user from chat
    this.roomService.kickUser(roomId, kickUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leaveRoom')
  async leaveRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);

    // remove the user from chat
    // does not remove admin status
    this.roomService.kickUser(roomId, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('changePassword')
  async changePassword(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('newPassword') newPassword: string,
  ) {
    const clientId =  Number(req.user.id);
    roomId = Number(roomId);

    // only alow the chat owner and admins to change chat password
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to change the password');

    // passcode will be hashed in changePassword
    return await this.roomService.changePassword(roomId, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('changeAccess')
  async changeAccess(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('newAccess') newAccess: Access,
    @Query('newPassword') newPassword: string = undefined,
  ) {
    const clientId = req.user.id;
    roomId = Number(roomId);

    if (newAccess === Access.PROTECTED && newPassword === undefined)
      throw new BadRequestException('A change to password protected chat requires an new password');
    else if (newAccess !== Access.PROTECTED)
      newPassword = undefined;

    // only alow the chat owner and admins to change chat password
    if (await this.chatService.isAdminOrOwner(roomId, clientId) === false)
      throw new ForbiddenException('Only chat owner or admin is alowed to change the access level');

    // change chat type to protected instead?
    return await this.roomService.changeAccess(roomId, newAccess, newPassword);
  }
}
