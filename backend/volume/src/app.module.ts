import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';

// import only the modules which provide the controllers

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    GameModule
  ],
})
export class AppModule {}
