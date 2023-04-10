import { DefaultElementSize, MapSize, MoveSpeedPerTick, PlayerDefinitions, PowerUpEffects, PowerUpModifier, PowerUpTimings } from './game.definitions';
import { Paddle } from './game.paddle';
import { GameData } from './game.service';

export class PowerUp {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = 0;
  yDirection: number = MoveSpeedPerTick.POWERUP;
  radius: number = DefaultElementSize.POWERUPRADIUS;
  hitsSinceLastPowerUp: number = 0;
  powerUpOnField: Boolean = false;
  powerUpEnabled: Boolean = false;
  targetPlayer: PlayerDefinitions;
  timeActivated: number;
  timeSinceLastReset: number = new Date().getTime();
  effect: PowerUpEffects;

  update(game: GameData) {
    if (this.hitsSinceLastPowerUp >= 1 && this.powerUpEnabled === false && this.powerUpOnField === false &&
      new Date().getTime() - this.timeSinceLastReset >= PowerUpTimings.SPAWN_TIMER) {
      this.spawnPowerUp(game);
      return ;
    }

    if (this.powerUpOnField) {
      // console.log(`PowerUp position: ${this.x} ${this.y}`);
      this.movePowerUp();
      this.checkCollision(game);
    }

    if (this.powerUpEnabled) {
      this.updatePaddleEffect(game);
    }
  }

  private checkCollision(game: GameData) {
    if (this.powerUpOnField === false)
      return ;
    
    let collision: Boolean = false;

    // Sets all debuffs and buffs to target the right player
    // if ball collision
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

    // currently unused since the ball only moves up and down
    // // if paddle collision
    // if (this.powerUpPaddleCollision(game)) {
    //   collision = true;
    //   if (game.ball.x < MapSize.WIDTH / 2 &&
    //     (this.effect === PowerUpEffects.FREEZE_ENEMY ||
    //     this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY))
    //     this.targetPlayer = PlayerDefinitions.PLAYER1;
    //   else
    //       this.targetPlayer = PlayerDefinitions.PLAYER2;
    //     }

    if (collision)
      this.enablePowerUps(game);
  }

  private enablePowerUps(game: GameData) {
    const messages: string[] = ['Paddle Slow', 'Paddle Speed', 'Ball Radius', 'Super Smash', 'Freeze'];
    console.log(`Turning on PowerUp ${messages[this.effect]} for player ${this.targetPlayer + 1}`);
    this.timeActivated = new Date().getTime();
    this.powerUpEnabled = true;
    this.powerUpOnField = false;
    game.powerUpOnField = false;

    game.emit('EnablePowerUp', messages[this.effect]);
    if (this.effect === PowerUpEffects.BALL_SMASH)  // Speeds up the ball for one 'turn' on the next paddle hit
      this.ballEffect(game);
    else if (this.effect === PowerUpEffects.BALL_RADIUS) // decreases the ball's radius till the next paddle hit
      this.ballEffect(game);
    else if (this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY ||
            this.effect === PowerUpEffects.PADDLE_SPEED_BUFF ||
            this.effect === PowerUpEffects.FREEZE_ENEMY) {
      this.enablePaddleEffect(game);
    }
  }

  private spawnPowerUp(game: GameData) {
    game.powerUpOnField = true;
    this.powerUpOnField = true;
    this.effect = getRandomInt(5);

    const xMin = MapSize.WIDTH / 2 - DefaultElementSize.PADDLEWIDTH * 3;
    const xMax = MapSize.WIDTH / 2 + DefaultElementSize.PADDLEWIDTH * 3;
    const yMin = 0 + this.radius;
    const yMax = MapSize.HEIGHT - this.radius;

    // gets a random position inside the middle of the map
    this.x = randomIntFromInterval(xMin, xMax);
    this.y = randomIntFromInterval(yMin, yMax);

    // If the ball is too close to the powerUp change its spawn location
    if (Math.abs(game.ball.x - this.x) <= this.radius * 10 &&
        Math.abs(game.ball.y - this.y) <= this.radius * 10)
      this.y = (this.y + 250) % MapSize.HEIGHT;

    // console.log(`spawned a powerup at location ${this.x} ${this.y} of type ${this.effect}`);
  }

  private updatePaddleEffect(game: GameData) {
    // if the time between now and when the power up was activated is above the threshold it will reset
    const limit: PowerUpTimings[] = [
      PowerUpTimings.SLOW_TIME,
      PowerUpTimings.SPEED_TIME,
      PowerUpTimings.NOT_TIME_BASED,
      PowerUpTimings.NOT_TIME_BASED,
      PowerUpTimings.FREEZE_TIME];

    if (limit[this.effect] === PowerUpTimings.NOT_TIME_BASED)
      return ;

    const timePassed = new Date().getTime() - this.timeActivated;

    if (timePassed >= limit[this.effect])
      this.resetPowerUpState(game, false);
  }

  private enablePaddleEffect(game: GameData) {
    if (this.effect === PowerUpEffects.PADDLE_SPEED_BUFF) {
    //   console.log(`triggered a paddle speed buff power up on player ${this.targetPlayer}`);
      game.players[this.targetPlayer].paddle.acceleration += PowerUpModifier.PaddleSpeedIncrease;
    }
    else if (this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY) {
    //   console.log(`triggered a paddle slow debuff power on player ${this.targetPlayer}`);
      game.players[this.targetPlayer].paddle.acceleration -= PowerUpModifier.PaddleSpeedDecrease;
    }
    else if (this.effect === PowerUpEffects.FREEZE_ENEMY) {
    //   console.log(`triggered a freeze power up on player ${this.targetPlayer}`);
      game.players[this.targetPlayer].paddle.acceleration = PowerUpModifier.Freeze;
    }
  }

  private ballEffect(game: GameData) {
    if (this.effect === PowerUpEffects.BALL_SMASH) {
    //   console.log('Triggered a ball speed power up!');
      game.ball.superSmash = true;
      game.ball.playerHoldingSmash = this.targetPlayer;
    }
    else if (this.effect === PowerUpEffects.BALL_RADIUS) {
    //   console.log('Triggered a ball radius power up!');
      game.ball.radius /= PowerUpModifier.BallRadiusDivision;
    }
  }

  resetPowerUpState(game: GameData, resetByPaddle: Boolean) {
    if (resetByPaddle && (this.effect === PowerUpEffects.FREEZE_ENEMY ||
              this.effect === PowerUpEffects.PADDLE_SLOW_ENEMY ||
              this.effect === PowerUpEffects.PADDLE_SPEED_BUFF))
      return ;
    this.powerUpEnabled = false;
    this.powerUpOnField = false;
    this.hitsSinceLastPowerUp = 0;
    this.timeSinceLastReset = new Date().getTime();
    game.powerUpOnField = false;
    game.ball.radius = DefaultElementSize.BALLRADIUS;
    game.players[PlayerDefinitions.PLAYER1].paddle.acceleration = 1;
    game.players[PlayerDefinitions.PLAYER2].paddle.acceleration = 1;
    game.ball.superSmash = false;
    game.emit('DisablePowerUp', '');
  }

  private powerUpBallCollision(game: GameData) {
    const xSqrd = (this.x - game.ball.x) * (this.x - game.ball.x);
    const ySqrd = (this.y - game.ball.y) * (this.y - game.ball.y);
    const radSqrd = (this.radius + game.ball.radius) * (this.radius + game.ball.radius);

    // simple ball with ball collision
    return Math.abs(xSqrd + ySqrd) < radSqrd;
  }

  private powerUpPaddleCollision(game: GameData) {
    // sets the side to check for which collision
    let side: PlayerDefinitions;
    if (this.x < MapSize.WIDTH / 2)
      side = PlayerDefinitions.PLAYER1;
    else
      side = PlayerDefinitions.PLAYER2;

    // this is the same as ball paddle collision but now used for the PowerUp
    const paddle: Paddle = game.players[side].paddle;
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

  private movePowerUp() {
    // Update PowerUp position
    this.x += this.xDirection;
    this.y += this.yDirection;

    // check if it hits the top of the playing field
    if (this.y + this.radius >= MapSize.HEIGHT)
      this.yDirection = Math.abs(this.yDirection) * -1;
    else if (this.y - this.radius <= 0)
      this.yDirection = Math.abs(this.yDirection);
    
    // check if it hits the bottom of the playing field
    if (this.x + this.radius >= MapSize.WIDTH)
      this.xDirection = Math.abs(this.xDirection) * -1;
    else if (this.x - this.radius <= 0)
      this.xDirection = Math.abs(this.xDirection);
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

