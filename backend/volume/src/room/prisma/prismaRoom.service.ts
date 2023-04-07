import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Prisma } from '@prisma/client';

@Injectable()
export class PrismaRoomService {
  constructor(private prisma: PrismaService) {}

  async Room(
    RoomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: RoomWhereUniqueInput,
    });
  }

  async RoomWithUsers(
    RoomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<any | null> {
    return this.prisma.room.findUnique({
      where: RoomWhereUniqueInput,
      include: {
        users: true,
      }
    });
  }

  async Rooms(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoomWhereUniqueInput;
    where?: Prisma.RoomWhereInput;
    orderBy?: Prisma.RoomOrderByWithRelationInput;
  }): Promise<Room[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.room.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
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
    const { where, data } = params;
    return this.prisma.room.update({
      data,
      where,
    });
  }

  async deleteRoom(where: Prisma.RoomWhereUniqueInput): Promise<Room> {
    return this.prisma.room.delete({
      where,
    });
  }
}
