import { Injectable } from '@nestjs/common';
import { PrismaMsgService } from 'src/msg/prisma/prismaMsg.service';

@Injectable()
export class MsgService {
  constructor(private prismaMsg: PrismaMsgService) {}

  async handleIncomingMsg(dataInDto: MsgDto) {
    this.prismaMsg.createMsgWithIds(dataInDto);
  };
}
