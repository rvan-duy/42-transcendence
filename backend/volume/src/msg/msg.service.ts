import { Injectable } from '@nestjs/common';
import { PrismaMsgService } from 'src/msg/prisma/prismaMsg.service';
// import { MsgDto } from './msg.dto';

@Injectable()
export class MsgService {
  constructor(private prismaMsg: PrismaMsgService) {}

  async handleIncomingMsg(dataInDto: MsgDto) {
    this.prismaMsg.createMsgWithIds(dataInDto);
  }
}
