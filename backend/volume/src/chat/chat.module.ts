import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MsgModule } from '../msg/msg.module';

@Module({
  imports: [MsgModule],
  controllers: [],
  providers: [ChatGateway],
  exports: [],
})
export class ChatModule {}