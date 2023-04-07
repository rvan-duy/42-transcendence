import { PrismaRoomService } from './prisma/prismaRoom.service';
import { Injectable } from '@nestjs/common';
import { Access, Status } from '@prisma/client';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';

export interface roomDto {
  name: string;
  ownerId: number;
  access: Access;
}

@Injectable()
export class RoomService {
  constructor(
    private prismaRoom: PrismaRoomService,
    private prismaUser: PrismaUserService,
  ) {}

  //  creates a new chatroom
  async createChat(roomData: roomDto) {
    this.prismaRoom.createRoom(roomData);
  }

  // adds user to the chatroom
  // need to add uban to this too? FUTURE feature
  async addToChat(userId: number, roomId: number) {
    this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        users: {
          connect: {
            id: userId,
          }
        }
      }
    });
  }

  // fetches all users of this chatroom
  async getRoomUsers(roomId: number){
    const roomAndUsers = await this.prismaRoom.RoomWithUsers({id: roomId});
    console.log(roomAndUsers.users);
    return(roomAndUsers.users);
    // return([1, 2, 3]); //This might be a tiny bit hardcoded atm. (Alice, Bob, and You <3)
  }

  async removeChat(roomId: number) {
    this.prismaRoom.deleteRoom({id: roomId});
  }

  async makeAdmin(roomId: number, userId: number) {
    this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        admin: {
          connect: {
            id: userId,
          }
        }
      }
    });
  }

  async getPublicRooms() {
    return (this.prismaRoom.Rooms({
      where: {
        access: Access.PUBLIC,
      }
    }))
  }

  async removeAdmin(roomId: number, userId: number) {
    this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        admin: {
          disconnect: {
            id: userId,
          }
        }
      }
    });
  }

  async banUser(roomId: number, userId: number) {
    this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        banMute: {
          create: {
            userId: userId,
            status: Status.BANNED,
            timestamp: new Date(Date.now() + 45000), // 45sec
          }
        }
      }
    });
  }

  async muteUser(roomId: number, userId: number) {
    this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        banMute: {
          create: {
            userId: userId,
            status: Status.MUTED,
            timestamp: new Date(Date.now() + 45000), // 45sec
          }
        }
      }
    })
  }

}
