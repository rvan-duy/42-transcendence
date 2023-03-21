import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { PrismaRoomService } from './prismaRoom.service';

@Module({
  imports: [PrismaClient, UserModule],
  controllers: [],
  providers: [PrismaRoomService, PrismaService],
  exports: [PrismaRoomService],
})
export class PrismaRoomModule {}