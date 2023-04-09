import { Injectable } from '@nestjs/common';
import { Access } from '@prisma/client';
import { PrismaRoomService } from 'src/room/prisma/prismaRoom.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class ChatService {
  constructor(
    private roomService: RoomService,
    private prismaRoomService: PrismaRoomService,

  ){}

  async IsAdminOrOwner(roomId: number, userId: number) {
    return (this.isAdmin(roomId, userId) || this.isOwner(roomId, userId));
  }

  async isOwner(roomId: number, userId: number) {
    const room = await this.prismaRoomService.Room({id: roomId});
    if (room.ownerId === userId)
      return true;
    return false;
  }

  async isAdmin(roomId: number, userId: number) {
    const room = await this.prismaRoomService.RoomWithUsers({id: roomId});
    if (room.access === Access.PUBLIC)
      return true;
    if (room.ownerId === userId)
      return true;
    for (let i = 0; i++; i < room.admin.length) {
      if (room.admin[i].id === userId)
        return true;
    }
    return false;
  }

  async isChatter(roomId: number, userId: number) {
    const room = await this.prismaRoomService.RoomWithUsers({id: roomId});
    if (room.access === Access.PUBLIC)
      return true;
    if (room.ownerId === userId)
      return true;
    for (let i = 0; i++; i < room.users.length) {
      if (room.users[i].id === userId)
        return true;
    }
    return false;
  }
  
}