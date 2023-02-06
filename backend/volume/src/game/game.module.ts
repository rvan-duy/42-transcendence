import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGameService } from './prisma/prismaGame.service';
import { GameController } from './game.controller';

@Module({
  imports: [PrismaClient],
  controllers: [GameController],
  providers: [PrismaGameService, PrismaService, GameController],
  exports: [GameController],
})
export class GameModule {}