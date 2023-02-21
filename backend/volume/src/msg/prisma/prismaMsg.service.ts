import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  
  async createMsgWithIds(msgDto: MsgDto): Promise<Msg> {
    const { roomId, authorId } = msgDto; // extract roomId and authorId from data
    
    // Authenticate here?

    // retrieve the Room and User objects using their IDs
    let room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
    });

    // update the lastId so there are no duplicates
    room.lastId++;
    // update in database
    await this.prisma.room.update({
      where: { id: room.id},
      data: { lastId: room.lastId}
    })
    
    // create the Msg object using the retrieved Room and User objects
    return this.prisma.msg.create({
      data: {
        body: msgDto.body,
        invite: msgDto.invite,
        id: room.lastId,
        room: { connect: { id: roomId } },
        author: { connect: { id: authorId } },
      },
    });
  }

}

