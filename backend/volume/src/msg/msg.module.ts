import { Module } from '@nestjs/common';
import { PrismaMsgModule } from './prisma/prismaMsg.module';
import { MsgService } from './msg.service';

@Module({
  imports: [PrismaMsgModule],
  controllers: [],
  providers: [MsgService],
  exports: [MsgService],
})
export class MsgModule {}