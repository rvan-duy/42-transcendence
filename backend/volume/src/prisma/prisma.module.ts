import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service'

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [UserService, PrismaService],
  exports: [UserService, PrismaService],
})
export class PrismaModule {}