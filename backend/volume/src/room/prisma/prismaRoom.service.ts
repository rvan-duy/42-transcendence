import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Prisma } from '@prisma/client';

@Injectable()
export class PrismaRoomService {
  constructor(private prisma: PrismaService) {}

  async Room(
    RoomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<Room | null> {
    try {
      return this.prisma.room.findUnique({
        where: RoomWhereUniqueInput,
      });
    } catch {
      return undefined;
    }
  }

  async RoomWithUsers(
    RoomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<any | null> {
    try {
      return this.prisma.room.findUnique({
        where: RoomWhereUniqueInput,
        include: {
          users: true,
        }
      });
    } catch {
      return undefined;
    }
  }

  async roomWithAdmins(
    RoomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<any | null> {
    try {
      return this.prisma.room.findUnique({
        where: RoomWhereUniqueInput,
        include: {
          admin: true,
        }
      });
    } catch {
      return undefined;
    }
  }

  async Rooms(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoomWhereUniqueInput;
    where?: Prisma.RoomWhereInput;
    orderBy?: Prisma.RoomOrderByWithRelationInput;
  }): Promise<Room[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      return this.prisma.room.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch {
      return undefined;
    }
  }

  async createRoom(data: Prisma.RoomCreateInput): Promise<Room> {
    return this.prisma.room.create({
      data,
    });
  }

  async updateRoom(params: {
    where: Prisma.RoomWhereUniqueInput;
    data: Prisma.RoomUpdateInput;
  }): Promise<Room> {
    try {
      const { where, data } = params;
      return this.prisma.room.update({
        data,
        where,
      });
    } catch {
      return undefined;
    }
  }

  async deleteRoom(where: Prisma.RoomWhereUniqueInput): Promise<Room> {
    try {
      return this.prisma.room.delete({
        where,
      });
    } catch {
      return undefined;
    }
  }
}
