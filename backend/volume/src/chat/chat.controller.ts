import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Room, Access } from '@prisma/client';
import { PrismaRoomService } from 'src/room/prisma/prismaRoom.service';
import { CryptService } from 'src/crypt/crypt.service';
import { RoomService } from 'src/room/room.service';
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
      return ; // this cannot work
    if (access === Access.PROTECTED)
      password = await this.cryptService.hashPassword(password);
    else
      password = undefined;

	const userId = req.user.id;

	if (access === Access.PUBLIC) // If the chat is public, don't add user to list of room's users, or the chat will show up twice for them.
		var roomUser: number = 1;
	else
		var roomUser: number = userId; 

    return this.prismaRoomService.createRoom({
      owner: {
        connect: {
          id: userId,
        },
      },
      users: {
        connect: {
          id: roomUser,
        }
      },
      name: roomName,
      access,
      hashedCode: password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('joinRoom')
  async handleJoinRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('password') password: string,
  ) {
    const userId = req.user.id;
    const room = await this.prismaRoomService.Room({id: roomId});
    switch (room.access) {
    case Access.PRIVATE:
      return ; // you need to be added to this chat
    case Access.PROTECTED:
      if (await this.cryptService.comparePassword(password, room.hashedCode) === false)
        return ; // incorrect password
      this.roomService.addToChat(userId, roomId);
      break ;
    case Access.PUBLIC:
      return ; // not added to public rooms since everyone is part unless kicked / blocked
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('myRooms')
  async getMyRooms(
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const userWithChats = await this.userService.userChats({id: userId});
    const chatsFromUser = userWithChats.rooms as Room[];
      
    // get public chats and add them to the list
    const publicChats = await this.roomService.getPublicRooms();
    const combinedChats = chatsFromUser.concat(publicChats);
      
    // return all available chat for users to sender
    return combinedChats;
  }

  @UseGuards(JwtAuthGuard)
  @Post('destroyRoom')
  async destroyRoom(
        @Request() req: any,
        @Query('roomId') roomId: number,
  ) {
    const userId =req.user.id;

    // is the sender is not the chat owner leave it intact and return and error
    if (await this.chatService.isOwner(roomId, userId) === false)
      return ;  // add error return later

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

    // is the sender is not the chat owner leave it intact and return and error
    if (await this.chatService.isOwner(roomId, clientId) === false)
      return ;  // add error return later

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

    // only alow the chat owner and admins to add members to the chat
    if (await this.chatService.IsAdminOrOwner(roomId, clientId) === false)
      return ;  // add error return later

    // add the user to the chat
    this.roomService.addToChat(userId, roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('banUserFromRoom')
  async banUserFromRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('userToBan') banUserId: number,
  ) {
    const clientId = req.user.id;

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.IsAdminOrOwner(roomId, clientId) === false)
      return ;  // add error return later

    // check if the muted user is not the owner
    if (this.chatService.isOwner(roomId, banUserId))
      return ;

    // add user to the banned list in this chat
    this.roomService.banUser(roomId, banUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('muteUserInRoom')
  async muteUserInRoom(
    @Request() req: any,
    @Query('roomId') roomId: number,
    @Query('userToMute') muteUserId: number,
  ) {
    const clientId = req.user.id;

    // only alow the chat owner and admins to ban members from the chat
    if (await this.chatService.IsAdminOrOwner(roomId, clientId) === false)
      return ;  // add error return later

    // check if the muted user is not the owner
    if (this.chatService.isOwner(roomId, muteUserId))
      return ;

    // add user to the muted list in this chat
    this.roomService.muteUser(roomId, muteUserId);
  }
}