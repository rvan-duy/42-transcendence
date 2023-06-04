export enum MapSize {
  WIDTH = 1000,
  HEIGHT = 600,
}

export enum GameMode {
  NORMAL = 'Normal',
  FREEMOVE = 'FreeMove',
  POWERUP = 'PowerUp',
  FIESTA = 'Fiesta',
  UNMATCHED = 'UnMatched',
  NOTQUEUED = 'NotQueued',
  }

export class CurrentGameState {
  score:number[] = [0, 0];
  leftPaddleDirection: Boolean[] = [false, false, false, false]; // up dow left right
  leftPaddleCoords: number[] = [0, MapSize.HEIGHT / 2];
  leftPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  leftPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  leftPaddleAcceleration: number = 0;
  rightPaddleDirection: Boolean[] = [false, false, false, false]; // up dow left right
  rightPaddleCoords: number[] = [MapSize.WIDTH, MapSize.HEIGHT / 2];
  rightPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  rightPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  rightPaddleAcceleration: number = 0;
  ballOnField: Boolean = false;
  ballCoords: number[] = [MapSize.WIDTH / 2, MapSize.HEIGHT / 2];
  ballDirection: number[] = [0, 0];
  ballRadius: number = DefaultElementSize.BALLRADIUS;
  ballAcceleration: number = 1;
  ballSmashEnabled: Boolean = false;
  ballSmashHolder: PlayerDefinitions = PlayerDefinitions.PLAYER1;
  powerUpOnField: Boolean = false;
  powerUpEnabled: Boolean = false;
  powerUpCoords: number[] = [0, 0];
  powerUpDirection: number[] = [0, 0];
  powerUpTarget: PlayerDefinitions = PlayerDefinitions.PLAYER1;
  powerUpEffect: PowerUpEffects = PowerUpEffects.BALL_RADIUS;
  powerUpRadius: number = 0;
}

export enum PowerUpEffects {
  PADDLE_SLOW_ENEMY, // slow effect for x amount of seconds
  PADDLE_SPEED_BUFF, // speed effect for x amount of seconds
  BALL_RADIUS, // ball radius decrease till next paddle hit
  BALL_SMASH, // enables a smash on your next hit
  FREEZE_ENEMY, // freeze effect for x amount of seconds
  }


export enum PowerUpModifier {
    BallSpeedIncrease = 1.5,
    BallRadiusDivision = 2,
    PaddleSpeedIncrease = 1.5,
    PaddleSpeedDecrease = 0.3,
    Freeze = 0,
    }

export enum PlayerDefinitions {
  PLAYER1,
  PLAYER2,
  }

export enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
  POWERUPRADIUS = 15,
  }

export enum MoveSpeedPerTick {
  PADDLE = 2.5,
  BALL = 4,
  POWERUP = 5,
  MAX_BALL_SPEED = 15,
  }
