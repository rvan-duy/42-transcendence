import { BallStatus, GameMode, MapSize, MoveSpeedPerTick, PlayerDefinitions, PowerUpEffects } from './game.definitions';
import { Paddle } from './game.paddle';
import { GameData } from './game.service';

export class Ball {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = (getRandomInt(10) % 2) ? (1.0 * MoveSpeedPerTick.BALL) : (-1.0 * MoveSpeedPerTick.BALL);
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

  update(game: GameData) {
    let side: PlayerDefinitions;
  
    // check what side of the map the ball is on and which paddle to check collision for
    if (game.ball.x + this.radius < MapSize.WIDTH / 2)
      side = PlayerDefinitions.PLAYER1;
    else
      side = PlayerDefinitions.PLAYER2;

    // assign the right paddle to check collision for
    const paddle: Paddle = game.players[side].paddle;

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
        game.powerUp.resetPowerUpState(game, true);
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
        if (game.powerUp.powerUpEnabled === false)
          game.powerUp.hitsSinceLastPowerUp++;
        else if (game.powerUp.effect !== PowerUpEffects.BALL_SMASH)
          game.powerUp.resetPowerUpState(game, true);
      }
    }

    // Check if the ball has hit the score line
    if (this.x - this.radius <= 0 || this.x + this.radius >= MapSize.WIDTH)
      return (BallStatus.SCORED);
    return (BallStatus.MOVING);
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
