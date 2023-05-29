import { Injectable } from '@nestjs/common';
import { Access, Status, UserTimestamp } from '@prisma/client';
import { Socket } from 'socket.io';
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
    const room = await this.prismaRoomService.roomWithAdmins({id: roomId});
    if (room === undefined)
      return false;
    if (room.access === Access.PUBLIC)
      return true;
    if (room.ownerId === userId)
      return true;
    if (room.admin.some(admin => admin.id === userId))
      return true;
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
    if (room.users.some(user => user.id === userId))
      return true;
    return false;
  }

  clearPast(arr: UserTimestamp[], roomId: number) {
    const timeNow = new Date();
    const cleanedArr: UserTimestamp[] = [];
    const removedIds: number[] = [];
  
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].timestamp >= timeNow) {
        cleanedArr.push(arr[i]);
      } else {
        removedIds.push(arr[i].id);
      }
    }

    // check if updated and push if needed
    if (cleanedArr.length !== arr.length) {
      this.prismaRoomService.updateRoom({
        where: { id: roomId },
        data: {
          banMute: {
            disconnect: removedIds.map(id => ({id})),
          }
        }
      });
    }

    return cleanedArr;
  }

  async mutedCheck(userId: number, roomId: number, client: Socket): Promise<boolean> {
    const roomWithBanMute = await this.prismaRoomService.roomWithBanMute({
      id: roomId,
    });
    if (roomWithBanMute === undefined)
      return true; // room does not exist

    let banMute: UserTimestamp[] = roomWithBanMute.banMute;

    // clean the array for outdated stuff and send back
    banMute = this.clearPast(banMute, roomId);

    for (let index = 0; index < banMute.length; index++) {
      const element = banMute[index];
      if (element.userId === userId && element.status === Status.MUTED) {
        client.emit('receiveNewMsg', {body: 'You are muted.', author: {name: 'The system'}, invite: false});
        return true;
      }
    }
    return false;
  }
}
