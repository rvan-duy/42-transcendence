import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Msg, Prisma } from '@prisma/client';

@Injectable()
export class PrismaMsgService {
  constructor(private prisma: PrismaService) {}

  async Msg(
    MsgWhereUniqueInput: Prisma.MsgWhereUniqueInput,
  ): Promise<Msg | null> {
    return this.prisma.msg.findUnique({
      where: MsgWhereUniqueInput,
    });
  }

  async Msgs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MsgWhereUniqueInput;
    where?: Prisma.MsgWhereInput;
    orderBy?: Prisma.MsgOrderByWithRelationInput;
  }): Promise<Msg[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.msg.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createMsg(data: Prisma.MsgCreateInput): Promise<Msg> {
    return this.prisma.msg.create({
      data,
    });
  }

  async updateMsg(params: {
    where: Prisma.MsgWhereUniqueInput;
    data: Prisma.MsgUpdateInput;
  }): Promise<Msg> {
    const { where, data } = params;
    return this.prisma.msg.update({
      data,
      where,
    });
  }

  async deleteMsg(where: Prisma.MsgWhereUniqueInput): Promise<Msg> {
    return this.prisma.msg.delete({
      where,
    });
  }
}
