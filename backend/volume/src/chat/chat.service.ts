import { Injectable } from '@nestjs/common';
import { Access } from '@prisma/client';
import { PrismaRoomService } from 'src/room/prisma/prismaRoom.service';

@Injectable()
export class ChatService {
  constructor(
    private prismaRoomService: PrismaRoomService,
  ){}

  async isOwner(roomId: number, userId: number) {
    const room = await this.prismaRoomService.Room({id: roomId});
    if (room === undefined)
      return false;
    if (room.ownerId === userId)
      return true;
    return false;
  }

  async isAdminOrOwner(roomId: number, userId: number) {
    const room = await this.prismaRoomService.RoomWithUsers({id: roomId});
    if (room === undefined)
      return false;
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
    if (room === undefined)
      return false;
    if (room.access === Access.PUBLIC)
      return true;
    if (room.ownerId === userId)
      return true;
    if (room.users.includes(userId))
      return true;
    return false;
  }
}