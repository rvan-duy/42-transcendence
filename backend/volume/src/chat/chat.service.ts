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

  async isOwner(roomId: number, userId: number) {
    try {
      const room = await this.prismaRoomService.Room({id: roomId});
      if (room.ownerId === userId)
        return true;
    } catch (error) {
      console.error('isOwner(): prisma.Room(): ', error);
    }
    return false;
  }

  async isAdminOrOwner(roomId: number, userId: number) {
    try {
      const room = await this.prismaRoomService.RoomWithUsers({id: roomId});
      if (room.access === Access.PUBLIC)
        return true;
      if (room.ownerId === userId)
        return true;
      for (let i = 0; i++; i < room.admin.length) {
        if (room.admin[i].id === userId)
          return true;
      }
    } catch (error) {
      console.error('isAdmin(): prisma.RoomWithUsers(): ', error);
    }
    return false;
  }

  async isChatter(roomId: number, userId: number) {
    try {
      const room = await this.prismaRoomService.RoomWithUsers({id: roomId});
      if (room === undefined)
        return false;
      if (room.access === Access.PUBLIC)
        return true;
      if (room.ownerId === userId)
        return true;
      if (room.users.includes(userId))
        return true;
    } catch (error) {
      console.error('isChatter(): ', error);
    }
    return false;
  }
}