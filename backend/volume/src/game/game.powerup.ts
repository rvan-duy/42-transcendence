import { DefaultElementSize, MapSize, MoveSpeedPerTick, PlayerDefinitions, PowerUpEffects } from "./game.definitions";
import { GameData } from "./game.service";

export class PowerUp {
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  hitsSinceLastPowerUp: number = 0;
  effect: PowerUpEffects;
  powerUpOnField: boolean = false;
  powerUpEnabled: boolean = false;
  playerEnabledOn: PlayerDefinitions;
  timeEnabled: number;

  update(game: GameData) {
    if (this.hitsSinceLastPowerUp >= 5 && this.powerUpEnabled === false &&
      this.powerUpOnField === false) {
      this.spawnPowerUp(game);
    }

    if (this.powerUpOnField && this.powerUpBallCollision(game))
      this.spawnPowerUp(game);

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
      else if (this.effect === PowerUpEffects.REMOVE_POINT) // removes a point from the target player
        this.removeEffect(game);
    }
  }

  private powerUpBallCollision(game: GameData) {
    return (false);

    // if ball collision
    this.powerUpEnabled = true;
    this.powerUpOnField = false;
    game.powerUpOnField = false;

  }

  private spawnPowerUp(game: GameData) {
    game.powerUpOnField = true;
    this.powerUpOnField = true;
    this.effect = getRandomInt(5);
    if (game.ball.xDirection < 0)
      this.playerEnabledOn = PlayerDefinitions.PLAYER1;
    else
      this.playerEnabledOn = PlayerDefinitions.PLAYER2;
  }

  private removeEffect(game: GameData) {

  }

  private paddleEffect(game: GameData) {

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

