export enum GameMode {
  NORMAL = 'Normal',
  FREEMOVE = 'FreeMove',
  POWERUP = 'PowerUp',
  FIESTA = 'Fiesta',
  UNMATCHED = 'UnMatched',
  }

export enum PaddleInput {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  }

export enum PlayerDefinitions {
  PLAYER1,
  PLAYER2,
  }

export enum MapSize {
  WIDTH = 1000,
  HEIGHT = 600,
  }

export enum MoveSpeedPerTick {
  PADDLE = 2.5,
  BALL = 4,
  POWERUP = 5,
  MAX_BALL_SPEED = 15,
  }

export enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
  POWERUPRADIUS = 15,
  }

// make paddle invisible?
export enum PowerUpEffects {
  PADDLE_SLOW_ENEMY, // slow effect for x amount of seconds
  PADDLE_SPEED_BUFF, // speed effect for x amount of seconds
  BALL_RADIUS, // ball radius decrease till next paddle hit
  BALL_SMASH, // enables a smash on your next hit
  FREEZE_ENEMY, // freeze effect for x amount of seconds
  }

export enum BallStatus {
  MOVING,
  SCORED,
  }

// timings are in milliseconds
export enum PowerUpTimings {
	FREEZE_TIME = 0.4 * 1000,
	SLOW_TIME = 0.7 * 1000,
	SPEED_TIME = 7 * 1000,
	NOT_TIME_BASED = -1,
	SPAWN_TIMER = 5 * 1000,
  }
  
export enum PowerUpModifier {
	BallSpeedIncrease = 1.5,
	BallRadiusDivision = 2,
	PaddleSpeedIncrease = 1.5,
	PaddleSpeedDecrease = 0.3,
	Freeze = 0,
  }