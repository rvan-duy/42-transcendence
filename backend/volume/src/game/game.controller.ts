import {
  Controller,
  Get,
  Param,
  //Post, linter complains about this, it is unused
} from '@nestjs/common';
import { Game as GameModel} from '@prisma/client';
import { PrismaGameService } from './prisma/prismaGame.service';

// should only be allowed to get games as these will be created by the engine
@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: PrismaGameService
  ) {}

  @Get('id/:id')
  async getGameById(@Param('id') id: string): Promise<GameModel> {
    return this.gameService.game({ id: Number(id) });
  }

  @Get('all')
  async getGames(): Promise<GameModel[]> {
    return this.gameService.games({});
  }
}