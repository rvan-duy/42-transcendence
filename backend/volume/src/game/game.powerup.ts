import { DefaultElementSize, MapSize, MoveSpeedPerTick, PlayerDefinitions, PowerUpEffects } from './game.definitions';
import { GameData } from './game.service';

export class PowerUp {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  hitsSinceLastPowerUp: number = 0;
  effect: PowerUpEffects;
  powerUpOnField: boolean = false;
  powerUpEnabled: boolean = false;
  targetPlayer: PlayerDefinitions;
  timeEnabled: number;

  update(game: GameData) {
    if (this.hitsSinceLastPowerUp >= 5 && this.powerUpEnabled === false &&
      this.powerUpOnField === false) {
      this.spawnPowerUp(game);
      return ;
    }

    if (this.powerUpOnField)
      this.checkCollision(game);

    if (this.powerUpEnabled) {
      if (this.effect === PowerUpEffects.FREEZE_ENEMY) // stops the opponent from moving for x amount of game-ticks/seconds
        this.paddleEffect(game);
      else if (this.effect === PowerUpEffects.PADDLE_SPEED_BUFF) // speeds the player up for x amount of game-ticks/seconds
        this.paddleEffect(game);
      else if (this.effect === PowerUpEffects.PADDLE_SPEED_DEBUFF_ENEMY) // slows the opponent for x amount of game-ticks/seconds
        this.paddleEffect(game);
      else if (this.effect === PowerUpEffects.BALL_SPEED)  // speeds the ball up till the next paddle hit
        this.ballEffect(game);
      else if (this.effect === PowerUpEffects.BALL_RADIUS) // decreases the ball's radius till the next paddle hit
        this.ballEffect(game);
      else if (this.effect === PowerUpEffects.ADD_POINT) // removes a point from the target player
        this.addEffect(game);
    }
  }

  private checkCollision(game: GameData) {
    return (false);
    
    this.powerUpEnabled = true;
    this.powerUpOnField = false;
    game.powerUpOnField = false;
    
    // Sets all debuffs and buffs to target the right player

    // if ball collision
    if (game.ball.xDirection < 0 && (this.effect === PowerUpEffects.FREEZE_ENEMY ||
        this.effect === PowerUpEffects.PADDLE_SPEED_DEBUFF_ENEMY ||
        this.effect === PowerUpEffects.ADD_POINT))
      this.targetPlayer = PlayerDefinitions.PLAYER1;
    else
      this.targetPlayer = PlayerDefinitions.PLAYER2;
    
    // if paddle collision
    if (game.ball.x < MapSize.WIDTH / 2 && (this.effect === PowerUpEffects.FREEZE_ENEMY ||
      this.effect === PowerUpEffects.PADDLE_SPEED_DEBUFF_ENEMY ||
      this.effect === PowerUpEffects.ADD_POINT))
      this.targetPlayer = PlayerDefinitions.PLAYER1;
    else
      this.targetPlayer = PlayerDefinitions.PLAYER2;
  }

  private spawnPowerUp(game: GameData) {
    game.powerUpOnField = true;
    this.powerUpOnField = true;
    this.effect = getRandomInt(5); // only allow for add_point to spawn if a player is far behind

    // spawn somewhere away from the ball, paddles and sides.
    // Sometimes it can move and if a player is far behind it is stationary on his side of the field.
  }

  private addEffect(game: GameData) {
    game.score[this.targetPlayer] += 1;
    this.resetPowerUpState(game);
  }

  private paddleEffect(game: GameData) {
    if (this.powerUpEnabled) {
      // wait for a set timer to run out
      this.resetPowerUpState(game);
    }
    else {
      this.powerUpEnabled = true;
      if (this.effect === PowerUpEffects.PADDLE_SPEED_BUFF)
        game.players[this.targetPlayer].paddle.acceleration += 0.5;
      else if (this.effect === PowerUpEffects.PADDLE_SPEED_DEBUFF_ENEMY)
        game.players[this.targetPlayer].paddle.acceleration -= 0.3;
      else if (this.effect === PowerUpEffects.FREEZE_ENEMY)
        game.players[this.targetPlayer].paddle.acceleration = 0;
    }
  }

  private ballEffect(game: GameData) {
    if (this.effect === PowerUpEffects.BALL_SPEED)
      game.ball.acceleration += 0.5;
    else
      game.ball.radius /= 2;
  }

  resetPowerUpState(game: GameData) {
    this.powerUpEnabled = false;
    this.powerUpOnField = false;
    this.timeEnabled = 0;
    this.hitsSinceLastPowerUp = 0;
    game.powerUpOnField = false;
    game.ball.radius = DefaultElementSize.BALLRADIUS;
    game.ball.acceleration = MoveSpeedPerTick.BALL;
    game.players[0].paddle.acceleration = MoveSpeedPerTick.PADDLE;
    game.players[1].paddle.acceleration = MoveSpeedPerTick.PADDLE;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

