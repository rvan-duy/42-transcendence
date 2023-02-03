import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaUserModule } from 'src/prisma/user/prismaUser.module';
import { PrismaUserService } from 'src/prisma/user/prismaUser.service';
import { UserController } from './userController.controller';

@Module({
  imports: [PrismaClient, PrismaUserModule],
  controllers: [UserController],
  providers: [PrismaUserService, PrismaService, UserController],
  exports: [UserController],
})
export class UserControllerModule {}