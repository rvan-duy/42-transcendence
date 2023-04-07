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

  async getChatHistory(roomId: number): Promise<MsgDto[]> {
    return this.prismaMsg.Msgs({
      where: {
        roomId: roomId,
      }
    });
  }

}
