import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGameService } from './prisma/prismaGame.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [PrismaClient],
  controllers: [GameController],
  providers: [PrismaGameService, PrismaService, GameController, GameGateway, GameService, MatchmakingService],
  exports: [GameController, GameService, MatchmakingService],
})
export class GameModule {}
