import { PrismaRoomService } from './prisma/prismaRoom.service';
import { Injectable } from '@nestjs/common';
import { Access, Status } from '@prisma/client';
import { CryptService } from 'src/crypt/crypt.service';

export interface roomDto {
  name: string;
  ownerId: number;
  access: Access;
  password: string;
}

function exclude<Room, Key extends keyof Room>(
  room: Room,
  keys: Key[]
): Omit<Room, Key> {
  if (room === undefined)
    return undefined;
  for (const key of keys) {
    delete room[key];
  }
  return room;
}

@Injectable()
export class RoomService {
  constructor(
    private prismaRoom: PrismaRoomService,
    private readonly cryptService: CryptService,
  ) { }

  //  creates a new chatroom
  async createChat(roomData: roomDto) {
    const { access, ownerId, name } = roomData;
    let { password } = roomData;

    // encrypt password when chat is proteced else leave undefined
    if (access === Access.PROTECTED)
      password = await this.cryptService.hashPassword(password);
    else
      password = undefined;

    return this.prismaRoom.createRoom({
      owner: {
        connect: {
          id: ownerId,
        },
      },
      admin: {
        connect: {
          id: ownerId,
        }
      },
      users: {
        connect: {
          id: ownerId,
        }
      },
      name: name,
      access: access,
      hashedCode: password,
    });
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

  async getDirectMsg(myId: number, friendId: number) {
    return await this.prismaRoom.getOrCreateDirectMessage(myId, friendId);
  }

  // fetches all users of this chatroom
  async getRoomUsers(roomId: number) {
    const roomAndUsers = await this.prismaRoom.RoomWithUsers({ id: roomId });
    return (roomAndUsers?.users);
  }

  async getRoomAdmins(roomId: number) {
    const roomAndUsers = await this.prismaRoom.roomWithAdmins({ id: roomId });
    return (roomAndUsers?.admin);
  }

  async getRoomById(roomId: number) {
    const room = await this.prismaRoom.Room({ id: roomId });
    const roomWithoutPasscode = exclude(room, ['hashedCode']);
    return roomWithoutPasscode;
  }

  async removeChat(roomId: number) {
    this.prismaRoom.deleteRoom({ id: roomId });
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

  async getPublicAndProtectedRooms(userId: number): Promise<any | null> {
    return (this.prismaRoom.Rooms({
      where: {
        OR: [
          {
            access: Access.PUBLIC,
            users: {
              none: {
                id: userId,
              }
            }
          },
          {
            access: Access.PROTECTED,
            users: {
              none: {
                id: userId,
              }
            }
          }
        ]
      }
    }));
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
    return await this.prismaRoom.updateRoom({
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
    });
  }

  async kickUser(roomId: number, userId: number) {
    return await this.prismaRoom.updateRoom({
      where: {
        id: roomId,
      },
      data: {
        users: {
          disconnect: {
            id: userId,
          }
        },
        admin: {
          disconnect: {
            id: userId,
          }
        }
      }
    });
  }

  async changeAccess(roomId: number, newAccess: Access, newPassword: string) {
    const room = await this.prismaRoom.updateRoom({
      where: { id: roomId },
      data: {
        access: newAccess,
        hashedCode: await this.cryptService.hashPassword(newPassword),
      },
    });
    const roomWithoutPasscode = exclude(room, ['hashedCode']);
    return roomWithoutPasscode;
  }

  async changePassword(roomId: number, newPassword: string) {
    const room = await this.prismaRoom.updateRoom({
      where: { id: roomId },
      data: {
        hashedCode: await this.cryptService.hashPassword(newPassword),
      },
    });
    const roomWithoutPasscode = exclude(room, ['hashedCode']);
    return roomWithoutPasscode;
  }
}
