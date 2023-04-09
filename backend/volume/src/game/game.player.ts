import { User } from '@prisma/client';
import { DefaultElementSize, MapSize, PaddleInput, PlayerDefinitions } from './game.definitions';
import { Paddle } from './game.paddle';

export class Player {
  constructor(playerData: User, side: PlayerDefinitions) {
    this.paddle = new Paddle;
    this.userId = playerData.id;
	this.name = playerData.name;
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
  name: string;
  paddle: Paddle;
  moveUp: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;

  updateInput(input: PaddleInput) {
    if (input === PaddleInput.DOWN)
      this.moveDown = this.moveDown ? false : true;
    else if (input === PaddleInput.UP)
      this.moveUp = this.moveUp ? false : true;
    else if (input === PaddleInput.LEFT)
      this.moveLeft = this.moveLeft ? false : true;
    else if (input === PaddleInput.RIGHT)
      this.moveRight = this.moveRight ? false : true;
  }
}
