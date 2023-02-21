import { Injectable } from '@nestjs/common';
import { PrismaMsgService } from 'src/msg/prisma/prismaMsg.service';
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
}
