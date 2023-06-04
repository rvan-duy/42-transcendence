import {
  CurrentGameState,
  DefaultElementSize,
  GameMode,
  MapSize,
  MoveSpeedPerTick,
  PlayerDefinitions,
  PowerUpEffects,
} from './game-definitions';

export class Game {
  score: number[] = [0, 0];
  ball = new Ball();
  powerUp: PowerUp = new PowerUp();
  paddles: Paddle[] = [new Paddle(), new Paddle()];
  mode: GameMode = GameMode.UNMATCHED;
  isFinished: Boolean = false;
  powerUpOnField: Boolean = false;

  update() {
    if (this.isFinished)
      return ;
      
    this.updatePaddles();

    this.ball.update(this);

    if (this.mode === GameMode.POWERUP || this.mode === GameMode.FIESTA) {
      this.powerUp.update(this);
    }
  }
  
  private updatePaddles() {
    this.paddles[PlayerDefinitions.PLAYER1].update(PlayerDefinitions.PLAYER1, this.mode);
    this.paddles[PlayerDefinitions.PLAYER2].update(PlayerDefinitions.PLAYER2, this.mode);
  }

  updateGameState(state: CurrentGameState) {
    this.score[0] = state.score[0];
    this.score[1] = state.score[1];
    this.paddles[PlayerDefinitions.PLAYER1].moveUp = state.leftPaddleDirection[0];
    this.paddles[PlayerDefinitions.PLAYER1].moveDown = state.leftPaddleDirection[1];
    this.paddles[PlayerDefinitions.PLAYER1].moveLeft = state.leftPaddleDirection[2];
    this.paddles[PlayerDefinitions.PLAYER1].moveRight = state.leftPaddleDirection[3];
    this.paddles[PlayerDefinitions.PLAYER1].x = state.leftPaddleCoords[0];
    this.paddles[PlayerDefinitions.PLAYER1].y = state.leftPaddleCoords[1];
    this.paddles[PlayerDefinitions.PLAYER1].width = state.leftPaddleWidth;
    this.paddles[PlayerDefinitions.PLAYER1].height = state.leftPaddleHeight;
    this.paddles[PlayerDefinitions.PLAYER1].acceleration = state.leftPaddleAcceleration;
    this.paddles[PlayerDefinitions.PLAYER2].moveUp = state.rightPaddleDirection[0];
    this.paddles[PlayerDefinitions.PLAYER2].moveDown = state.rightPaddleDirection[1];
    this.paddles[PlayerDefinitions.PLAYER2].moveLeft = state.rightPaddleDirection[2];
    this.paddles[PlayerDefinitions.PLAYER2].moveRight = state.rightPaddleDirection[3];
    this.paddles[PlayerDefinitions.PLAYER2].x = state.rightPaddleCoords[0];
    this.paddles[PlayerDefinitions.PLAYER2].y = state.rightPaddleCoords[1];
    this.paddles[PlayerDefinitions.PLAYER2].width = state.rightPaddleWidth;
    this.paddles[PlayerDefinitions.PLAYER2].height = state.rightPaddleHeight;
    this.paddles[PlayerDefinitions.PLAYER2].acceleration = state.rightPaddleAcceleration;
    this.ball.onField = state.ballOnField;
    this.ball.x = state.ballCoords[0];
    this.ball.y = state.ballCoords[1];
    this.ball.xDirection = state.ballDirection[0];
    this.ball.yDirection = state.ballDirection[1];
    this.ball.radius = state.ballRadius;
    this.ball.acceleration = state.ballAcceleration;
    this.ball.superSmash = state.ballSmashEnabled;
    this.ball.playerHoldingSmash = state.ballSmashHolder;
    this.powerUp.powerUpOnField = state.powerUpOnField;
    this.powerUp.powerUpEnabled = state.powerUpEnabled;
    this.powerUp.x = state.powerUpCoords[0];
    this.powerUp.y = state.powerUpCoords[1];
    this.powerUp.xDirection = state.powerUpDirection[0];
    this.powerUp.yDirection = state.powerUpDirection[1];
    this.powerUp.targetPlayer = state.powerUpTarget;
    this.powerUp.effect = state.powerUpEffect;
    this.powerUp.radius = state.powerUpRadius;
  }
}

export class PowerUp {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = 0;
  yDirection: number = MoveSpeedPerTick.POWERUP;
  radius: number = DefaultElementSize.POWERUPRADIUS;
  powerUpOnField: Boolean = false;
  powerUpEnabled: Boolean = false;
  targetPlayer: PlayerDefinitions = PlayerDefinitions.PLAYER1;
  effect: PowerUpEffects = PowerUpEffects.BALL_RADIUS;

  update(game: Game) {
    if (this.powerUpOnField) {
      this.movePowerUp();
      this.checkCollision(game);
    }
  }

  private movePowerUp() {
    // check if it hits the top or bottom of the playing field
    this.y += this.yDirection;
    if (this.y + this.radius >= MapSize.HEIGHT) {
      this.yDirection = Math.abs(this.yDirection) * -1;
    }
    else if (this.y - this.radius <= 0) {
      this.yDirection = Math.abs(this.yDirection);
    }
  }

  private checkCollision(game: Game) {
    if (this.powerUpOnField === false)
      return ;
    
    let collision: Boolean = false;

    // Sets all debuffs and buffs to target the right player
    if (this.powerUpBallCollision(game)) {
      collision = true;
      if (game.ball.xDirection > 0 &&
        (this.effect === PowerUpEffects.BALL_SMASH ||
        this.effect === PowerUpEffects.PADDLE_SPEED_BUFF))
        this.targetPlayer = PlayerDefinitions.PLAYER1;
      else if (game.ball.xDirection < 0 &&
        (this.effect === PowerUpEffects.FREEZE_ENEMY ||
        this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY))
        this.targetPlayer = PlayerDefinitions.PLAYER1;
      else
        this.targetPlayer = PlayerDefinitions.PLAYER2;
    }

    if (collision)
      this.powerUpOnField = false;
  }

  private powerUpBallCollision(game: Game) {
    const xSqrd = (this.x - game.ball.x) * (this.x - game.ball.x);
    const ySqrd = (this.y - game.ball.y) * (this.y - game.ball.y);
    const radSqrd = (this.radius + game.ball.radius) * (this.radius + game.ball.radius);

    // simple ball with ball collision
    return Math.abs(xSqrd + ySqrd) < radSqrd;
  }

  resetPowerUpState(game: Game, resetByPaddle: Boolean) {
    if (resetByPaddle && (this.effect === PowerUpEffects.FREEZE_ENEMY ||
      this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY ||
      this.effect === PowerUpEffects.PADDLE_SPEED_BUFF))
      return ;
    this.powerUpEnabled = false;
    this.powerUpOnField = false;
    game.powerUpOnField = false;
    game.ball.radius = DefaultElementSize.BALLRADIUS;
    game.paddles[PlayerDefinitions.PLAYER1].acceleration = 1;
    game.paddles[PlayerDefinitions.PLAYER2].acceleration = 1;
    game.ball.superSmash = false;
  }
}

export class Ball {
  onField: Boolean = false;
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = 0;
  yDirection: number = 0;
  acceleration: number = 1;
  radius: number = 20;
  superSmash: Boolean = false;
  playerHoldingSmash: PlayerDefinitions = PlayerDefinitions.PLAYER1;
  
  ballPaddleCollision(paddle: Paddle) {
    // temporary variables to set edges for testing
    let tempX: number = this.x;
    let tempY: number = this.y;
    
    // sets the closest edges into the temp variables
    // compare to left or right edges
    if (this.x <= paddle.x)
      tempX = paddle.x;
    else if (this.x > paddle.x + paddle.width)
      tempX = paddle.x + paddle.width;
  
    // compare to top or bottom edge
    if (this.y <= paddle.y)
      tempY = paddle.y;
    else if (this.y > paddle.y + paddle.height)
      tempY = paddle.y + paddle.height;
  
    // get distance from closest edges
    const distX: number = this.x - tempX;
    const distY: number = this.y - tempY;
    const distance: number = Math.sqrt((distX * distX) + (distY * distY));
  
    // if the distance is less than or equal to the radius there is a collision
    if (distance <= this.radius)
      return true;
    return false;
  }

  update(game: Game) {
    let side: PlayerDefinitions;
  
    if (this.onField === false)
      return ;

    // check what side of the map the ball is on and which paddle to check collision for
    if (this.x + this.radius < MapSize.WIDTH / 2)
      side = PlayerDefinitions.PLAYER1;
    else
      side = PlayerDefinitions.PLAYER2;

    // assign the right paddle to check collision for
    const paddle: Paddle = game.paddles[side];

    // Update ball position
    this.x += this.xDirection;
    this.y += this.yDirection;
  
    // check if ball hits the top or bottom of the map then invert it's y direction
    if (this.y + this.radius > MapSize.HEIGHT)
      this.yDirection = Math.abs(this.yDirection) * -1;
    else if (this.y - this.radius < 0)
      this.yDirection = Math.abs(this.yDirection);

    if (this.ballPaddleCollision(paddle)) {
      let speed = this.acceleration * MoveSpeedPerTick.BALL;
      const collisionPoint = this.y - (paddle.y + paddle.height / 2); // gets a point on the paddle that has a value between the paddle's height / 2 and negative paddle's height / 2
      const normalizedCollisionPoint = collisionPoint / paddle.height / 2; // sets the entire length of the paddle's collision points to be between -1 and 1
      const returnAngle = Math.PI / 3 * normalizedCollisionPoint; // 60 degrees (Pi / 3) times the normalized paddle collision point which is between 1 and -1
      const returnDirection = paddle.x < this.x ? 1 : -1; // check what side of the bat the ball gets hit

      if (this.superSmash && side === this.playerHoldingSmash) {
        speed *= 1.5;
      }

      // prevent this from moving through paddle
      if (speed > MoveSpeedPerTick.MAX_BALL_SPEED)
        speed = MoveSpeedPerTick.MAX_BALL_SPEED;

      this.xDirection = returnDirection * speed * Math.cos(returnAngle); // cos gets the value between the ball and the x angle
      this.yDirection = speed * Math.sin(returnAngle); // sin gets the value between the ball and the y angle

      // update the ball's acceleration after every paddle hit
      this.acceleration += 0.1;

      // resets the applied buff/debuff once a paddle hits the ball
      if (game.mode === GameMode.POWERUP || game.mode === GameMode.FIESTA) {
        if (game.powerUp.effect !== PowerUpEffects.BALL_SMASH)
          game.powerUp.resetPowerUpState(game, true);
      }
    }
  }
}

export class Paddle {
  x: number = 0;
  y: number = 0;
  width: number = DefaultElementSize.PADDLEWIDTH;
  height: number = DefaultElementSize.PADDLEHEIGHT;
  acceleration: number = 1;
  moveUp: Boolean = false;
  moveDown: Boolean = false;
  moveLeft: Boolean = false;
  moveRight: Boolean = false;

  update(side: PlayerDefinitions, mode: GameMode) {
    const paddleMovement:number = this.acceleration * MoveSpeedPerTick.PADDLE;

    // Get new y coordinate of paddle
    if (this.moveUp)
      this.y -= paddleMovement;
    if (this.moveDown)
      this.y += paddleMovement;

    // Check if paddle goes out of bounds
    if (this.y < 0)
      this.y = 0;
    else if (this.y + this.height > MapSize.HEIGHT)
      this.y = MapSize.HEIGHT - this.height;

    // sets new horizontal position if the right gamemode is selected
    if (mode === GameMode.FREEMOVE || mode === GameMode.FIESTA) {
      if (this.moveLeft)
        this.x -= paddleMovement;
      if (this.moveRight)
        this.x += paddleMovement;

      // Out of bounds check for both sides of the map depending on the player's side
      if (side === PlayerDefinitions.PLAYER1) {
        if (this.x + this.width > MapSize.WIDTH / 2 - DefaultElementSize.PADDLEWIDTH * 5)
          this.x = MapSize.WIDTH / 2 - this.width - DefaultElementSize.PADDLEWIDTH * 5;
        if (this.x < 0)
          this.x = 0;
      }
      else if (side === PlayerDefinitions.PLAYER2) {
        if (this.x < MapSize.WIDTH / 2 + DefaultElementSize.PADDLEWIDTH * 5)
          this.x = MapSize.WIDTH / 2 + DefaultElementSize.PADDLEWIDTH * 5;
        if (this.x + this.width > MapSize.WIDTH )
          this.x = MapSize.WIDTH - this.width;
      }
    }
  }
}
