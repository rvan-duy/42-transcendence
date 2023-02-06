import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaRoomService } from './prismaRoom.service';

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [PrismaRoomService, PrismaService],
  exports: [PrismaRoomService],
})
export class PrismaRoomModule {}