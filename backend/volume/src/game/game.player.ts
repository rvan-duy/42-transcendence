import { DefaultElementSize, MapSize, PlayerDefinitions } from "./game.definitions";
import { Paddle } from "./game.paddle";

export class Player {
  constructor(id: number, side: PlayerDefinitions) {
    this.paddle = new Paddle;
    this.userId = id;
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
  paddle: Paddle;
  moveUp: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;
}
