import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserService } from './prisma/prismaUser.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaClient, PrismaModule],
  controllers: [UserController],
  providers: [PrismaUserService],
  exports: [],
})
export class UserModule {}