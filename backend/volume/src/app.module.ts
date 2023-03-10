import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { MsgModule } from './msg/msg.module';

// import only the modules which provide the controllers

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    GameModule,
    ChatModule,
    MsgModule,
  ],
})
export class AppModule {}
