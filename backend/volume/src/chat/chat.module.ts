import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MsgModule } from '../msg/msg.module';
import { GateModule } from 'src/gate/gate.module';
import { RoomModule } from 'src/room/room.module';
@Module({
  imports: [MsgModule, RoomModule, GateModule],
  controllers: [],
  providers: [ChatGateway],
  exports: [],
})
export class ChatModule {}