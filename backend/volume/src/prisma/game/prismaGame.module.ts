import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { PrismaGameService } from './prismaGame.service';

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [PrismaGameService, PrismaService],
  exports: [PrismaGameService],
})
export class PrismaGameModule {}