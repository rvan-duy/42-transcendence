import { User } from '@prisma/client';
import { DefaultElementSize, MapSize, PaddleInput, PlayerDefinitions } from './game.definitions';
import { Paddle } from './game.paddle';

export class Player {
  constructor(playerData: User, side: PlayerDefinitions) {
    this.paddle = new Paddle;
    this.userId = playerData.id;
    this.name = playerData.name;
    this.elo = playerData.elo;
    this.wins = playerData.wins;
    this.losses = playerData.losses;
    if (side === PlayerDefinitions.PLAYER1) {
      this.paddle.x = 0;
      this.paddle.y = MapSize.HEIGHT / 2 - DefaultElementSize.PADDLEHEIGHT / 2;
    }
    else {
      this.paddle.x = MapSize.WIDTH - DefaultElementSize.PADDLEWIDTH;
      this.paddle.y = MapSize.HEIGHT / 2 - DefaultElementSize.PADDLEHEIGHT / 2;
    }
  }

  userId: number;
  elo: number;
  wins: number;
  losses: number;
  name: string;
  paddle: Paddle;
  moveUp: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;

  enableInput(input: PaddleInput) {
    if (input === PaddleInput.DOWN)
      this.moveDown = true;
    else if (input === PaddleInput.UP)
      this.moveUp = true;
    else if (input === PaddleInput.LEFT)
      this.moveLeft = true;
    else if (input === PaddleInput.RIGHT)
      this.moveRight = true;
  }

  disableInput(input: PaddleInput) {
    if (input === PaddleInput.DOWN)
      this.moveDown = false;
    else if (input === PaddleInput.UP)
      this.moveUp = false;
    else if (input === PaddleInput.LEFT)
      this.moveLeft = false;
    else if (input === PaddleInput.RIGHT)
      this.moveRight = false;
  }

  resetInput() {
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
  }
}
