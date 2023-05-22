import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma, Access } from '@prisma/client';

@Injectable()
export class PrismaUserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    }).catch(() => {
      return undefined;
    });
  }

  async userWithGames(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        games: {
          include: {
            players: true
          }
        },
      },
    }).catch(() => {
      return undefined;
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    }).catch(() => {
      return undefined;
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    }).catch(() => {
      return undefined;
    });
  }

  async findOrCreateUser(data: Prisma.UserCreateInput): Promise<User> {
    const { intraId, name } = data;
    return this.prisma.user.upsert({
      where: { intraId },
      update: {},
      create: { intraId, name },
    }).catch(() => {
      return undefined;
    });
  }

  async userChats(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        rooms: {
          where: {
            NOT: {
              access: Access.DM,
            }
          }
        }
      }
    }).catch(() => {
      return undefined;
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    }).catch(() => {
      return undefined;
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    }).catch(() => {
      return undefined;
    });
  }

  async onlyFriends(userId: number): Promise<any>{
    return this.users({
      where: {
        friends: {
          has: userId,
        }
      }
    });
  }

}
