import { BallStatus, DefaultElementSize, GameMode, MapSize, MoveSpeedPerTick, PlayerDefinitions } from './game.definitions';
import { Paddle } from './game.paddle';
import { GameData } from './game.service';

export class Ball {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = (getRandomInt(10) % 2) ? (1.0 * MoveSpeedPerTick.BALL) : (-1.0 * MoveSpeedPerTick.BALL);
  yDirection: number = 0;
  acceleration: number = 1;
  radius: number = 20;
  
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
    let paddle: Paddle;
  
    // check what side of the map the ball is on and which paddle to check collision for
    if (game.ball.x + this.radius < MapSize.WIDTH / 2)
      paddle = game.players[PlayerDefinitions.PLAYER1].paddle;
    else
      paddle = game.players[PlayerDefinitions.PLAYER2].paddle;
  
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
      const returnAngle = Math.PI / 4 * normalizedCollisionPoint; // 45 degrees (Pi / 4) times the normalized paddle collision point which is between 1 and -1
      const returnDirection = (this.x + this.radius < MapSize.WIDTH / 2) ? 1 : -1;

      // prevent this from moving through paddle
      if (speed > DefaultElementSize.PADDLEWIDTH)
        speed = DefaultElementSize.PADDLEWIDTH - 1;

      this.xDirection = returnDirection * speed * Math.cos(returnAngle); // cos gets the value between the ball and the x angle
      this.yDirection = speed * Math.sin(returnAngle); // sin gets the value between the ball and the y angle

      // update the ball's acceleration after every paddle hit
      this.acceleration += 0.1;

      // resets the applied buff/debuff once a paddle hits the ball
      if (game.mode === GameMode.POWERUP || game.mode === GameMode.FIESTA) {
        if (game.powerUp.powerUpEnabled === false)
          game.powerUp.hitsSinceLastPowerUp++;
        else
          game.powerUp.resetOnPaddleHit(game);
      }
    }

    // Check if the ball has hit the score line
    if (this.x - this.radius <= 0 || this.x + this.radius >= MapSize.WIDTH)
      return (BallStatus.SCORED);
    return (BallStatus.MOVING);
  
    // if (game.isFinished) // use this for temporary debugging
    //   this.resetGame(game);
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
