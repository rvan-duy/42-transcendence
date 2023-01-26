import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PostService } from './post.service';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service'

@Module({
  imports: [PrismaClient],
  controllers: [],
  providers: [UserService, PostService, PrismaService],
  exports: [UserService, PostService, PrismaService],
})
export class PrismaModule {}