import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserService } from './prisma/prismaUser.service';
import { UserController } from './user.controller';
import { StatusModule } from 'src/status/status.module';

@Module({
  imports: [PrismaClient, PrismaModule, StatusModule],
  controllers: [UserController],
  providers: [PrismaUserService],
  exports: [PrismaUserService],
})
export class UserModule {}