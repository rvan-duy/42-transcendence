import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGameModule } from 'src/prisma/game/prismaGame.module';
import { PrismaGameService } from 'src/prisma/game/prismaGame.service';
import { GameController } from './gameController.controller';

@Module({
  imports: [PrismaClient, PrismaGameModule],
  controllers: [GameController],
  providers: [PrismaGameService, PrismaService, GameController],
  exports: [GameController],
})
export class GameControllerModule {}