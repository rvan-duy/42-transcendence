import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Game as GameModel} from '@prisma/client';
import { PrismaGameService } from './prisma/prismaGame.service';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// should only be allowed to get games as these will be created by the engine

@Controller('game')
@ApiCookieAuth()
@ApiTags('game')
export class GameController {
  constructor(private readonly gameService: PrismaGameService) {}

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get game by id' })
  @ApiResponse({ status: 200, description: 'Game found', type: Object })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGameById(@Param('id') id: string): Promise<GameModel> {
    return this.gameService.game({ id: Number(id) });
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({ status: 200, description: 'Games found', type: [Object] })
  async getGames(): Promise<GameModel[]> {
    return this.gameService.games({});
  }
}