export enum MapSize {
  WIDTH = 1000,
  HEIGHT = 600,
}

export enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
}

export class CurrentGameState {
  score:number[] = [0, 0];
  leftPaddleCoords: number[] = [0, MapSize.HEIGHT / 2];
  leftPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  leftPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  rightPaddleCoords: number[] = [MapSize.WIDTH, MapSize.HEIGHT / 2];
  rightPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  rightPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  ballCoords: number[] = [MapSize.WIDTH / 2, MapSize.HEIGHT / 2];
  ballRadius: number = DefaultElementSize.BALLRADIUS;
  powerUpOnField: Boolean = false;
  powerUpCoords: number[] = [0, 0];
  powerUpRadius: number = 0;
}