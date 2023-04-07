import { Injectable } from '@nestjs/common';
import { PrismaMsgService } from 'src/msg/prisma/prismaMsg.service';

export interface MsgDto {
  id: number;
  roomId: number;
  body: string;
  authorId: number;
  invite: boolean;
}

@Injectable()
export class MsgService {
  constructor(private prismaMsg: PrismaMsgService) {}

  async handleIncomingMsg(dataInDto: MsgDto) {
    return this.prismaMsg.createMsgWithIds(dataInDto);
  }

  async handleDeleteMsg(data: MsgDto) {
    this.prismaMsg.updateMsg(
      {
        where: {
          roomId_id: {
            id: data.id,
            roomId: data.roomId,
          },
        },
        data: {
          body: 'deleted',
        }
      },
    );
  }

  async verifyAuthor(roomId: number, msgId: number, authorId: number) {
    const msg = await this.prismaMsg.Msg({roomId_id: {
      id: msgId,
      roomId: roomId,
    }});
    return msg.authorId === authorId;
  }

  async getChatHistory(roomId: number): Promise<MsgDto[]> {
    return this.prismaMsg.Msgs({
      where: {
        roomId: roomId,
      }
    });
  }

}
