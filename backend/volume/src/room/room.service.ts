import { PrismaRoomService } from './prisma/prismaRoom.service';
import { Injectable } from '@nestjs/common';
import { Access } from '@prisma/client';
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
	// this.prismaRoom.doSomething(
	// 	where: {
	// 		id: roomId,
	// 	  },
	// 	  data:{
	// 		alvast een templateje voor je gemaakt Ossie <3 
	// 	  }
	// )
	// return(['Ruben1', 'Ruben2', 'Dagmar', 'Oswin', 'Limartini']) 
	return([1, 2, 3]); //This might be a tiny bit hardcoded atm. (Alice, Bob, and You <3)
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
        banned: {
          create: {
            userId: userId,
            timestamp: new Date(Date.now() + 45000), // 45sec
          }
        }
      }
    });
  }

  // async muteUser(roomId: number, userId: number) {
  //   this.prismaRoom.updateRoom({
  //     where: {
  //       id: roomId,
  //     },
  //     data: {
  //       muted: {
  //         create: {
  //           userId: userId,
  //           timestamp: new Date(Date.now() + 45000), // 45sec
  //         }
  //       }
  //     }
  //   })
  // }

}
