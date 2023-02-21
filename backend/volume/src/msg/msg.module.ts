import { Module } from '@nestjs/common';
import { PrismaMsgModule } from './prisma/prismaMsg.module';

@Module({
  imports: [PrismaMsgModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MsgModule {}