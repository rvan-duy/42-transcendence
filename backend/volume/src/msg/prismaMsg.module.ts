import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaMsgService } from './prismaMsg.service';

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [PrismaMsgService, PrismaService],
  exports: [PrismaMsgService],
})
export class PrismaMsgModule {}