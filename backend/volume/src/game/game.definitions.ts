export enum GameMode {
  NORMAL = 'Normal',
  FREEMOVE = 'FreeMove',
  POWERUP = 'PowerUp',
  FIESTA = 'Fiesta',
  }

export enum PaddleInput {
  UP = 'KeyUp',
  DOWN = 'KeyDown',
  LEFT = 'KeyLeft',
  RIGHT = 'KeyRight',
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
  PADDLE = 2,
  BALL = 3,
  }

export enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
  POWERUPRADIUS = 15,
  }

export enum PowerUpEffects {
  PADDLE_SPEED_DEBUFF_ENEMY, // slow effect for x amount of seconds
  PADDLE_SPEED_BUFF, // speed effect for x amount of seconds
  BALL_RADIUS, // ball radius decrease till next paddle hit
  BALL_SPEED, // ball increase effect till next hit
  FREEZE_ENEMY, // freeze effect for x amount of seconds
  ADD_POINT, // instantly remove one point from the enemy score
  }

export enum BallStatus {
  MOVING,
  SCORED,
  }
