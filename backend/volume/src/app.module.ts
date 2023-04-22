import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { MsgModule } from './msg/msg.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TwoFactorAuthenticationModule } from './2fa/twoFactorAuthentication.module';
import { join } from 'path';

// import only the modules which provide the controllers

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    GameModule,
    ChatModule,
    MsgModule,
    TwoFactorAuthenticationModule,
    ServeStaticModule.forRoot({
      rootPath: join('/usr/src/app/public/'), // this path has to change depending on the environment
      serveRoot: '/public',
      serveStaticOptions: {
        index: false
      }
    }),
  ],
})
export class AppModule {}
