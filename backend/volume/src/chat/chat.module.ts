import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MsgModule } from '../msg/msg.module';
import { GateModule } from 'src/gate/gate.module';

@Module({
  imports: [MsgModule, GateModule],
  controllers: [],
  providers: [ChatGateway],
  exports: [],
})
export class ChatModule {}