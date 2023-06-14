import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GameStatus } from './game.status';

@Module({
  imports: [
    JwtModule,
  ],
  controllers: [
    
  ],
  providers: [
    GameStatus,
    {
      provide: 'gameStatus',
      useFactory: () => new GameStatus(),
      inject: [GameStatus],
    },
    {
      provide: 'matchmakingStatus',
      useFactory: () => new GameStatus(),
      inject: [GameStatus],
    },
  ],
  exports: [
    'gameStatus',
    'matchmakingStatus',
  ],
})
export class GameStatusModule {}