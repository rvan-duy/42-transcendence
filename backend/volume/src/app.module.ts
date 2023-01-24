import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './prisma/user.service';

@Module({
  imports: [PrismaClient],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
