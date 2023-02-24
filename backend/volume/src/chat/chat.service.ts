import { Injectable } from '@nestjs/common';
import { PrismaMsgService } from 'src/chat/prisma/prismaMsg.service';
// import { MsgDto } from './msg.dto';

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
    this.prismaMsg.createMsgWithIds(dataInDto);
  }

  async handleDeleteMsg(data: MsgDto) {
    this.prismaMsg.updateMsg(
      {
        where: {
          id_roomId: {
            id: data.id,
            roomId: data.roomId
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
