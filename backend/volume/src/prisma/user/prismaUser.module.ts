import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { PrismaUserService } from './prismaUser.service';

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [PrismaService, PrismaUserService],
  exports: [PrismaUserService],
})
export class PrismaUserModule {}