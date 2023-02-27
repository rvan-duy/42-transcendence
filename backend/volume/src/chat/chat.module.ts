import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaMsgModule } from '../msg/prisma/prismaMsg.module';

@Module({
  imports: [PrismaMsgModule],
  controllers: [],
  providers: [ChatGateway],
  exports: [],
})
export class ChatGatewayModule {}