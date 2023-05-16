import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MsgModule } from '../msg/msg.module';
import { GateModule } from 'src/gate/gate.module';
import { RoomModule } from 'src/room/room.module';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PrismaRoomModule } from 'src/room/prisma/prismaRoom.module';
import { JwtModule } from '@nestjs/jwt';
import { CryptModule } from 'src/crypt/crypt.module';
import { ChatController } from './chat.controller';
import { GameModule } from 'src/game/game.module';
@Module({
  imports: [MsgModule,
    RoomModule,
    GateModule,
    AuthModule,
    UserModule,
    PrismaRoomModule,
    JwtModule,
    CryptModule,
    GameModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [],
})
export class ChatModule {}