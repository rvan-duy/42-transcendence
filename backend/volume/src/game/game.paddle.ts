import { DefaultElementSize, GameMode, MapSize, MoveSpeedPerTick, PlayerDefinitions } from './game.definitions';
import { Player } from './game.player';

export class Paddle {
  x: number = 0;
  y: number = 0;
  width: number = DefaultElementSize.PADDLEWIDTH;
  height: number = DefaultElementSize.PADDLEHEIGHT;
  acceleration: number = 1;

  update(player: Player, side: PlayerDefinitions, mode: GameMode) {
    const paddleMovement:number = this.acceleration * MoveSpeedPerTick.PADDLE;

    // Get new y coordinate of paddle
    if (player.moveUp)
      this.y -= paddleMovement;
    if (player.moveDown)
      this.y += paddleMovement;

    // Check if paddle goes out of bounds
    if (this.y < 0)
      this.y = 0;
    else if (this.y + this.height > MapSize.HEIGHT)
      this.y = MapSize.HEIGHT - this.height;

    // sets new horizontal position if the right gamemode is selected
    if (mode === GameMode.FREEMOVE || mode === GameMode.FIESTA) {
      if (player.moveLeft)
        this.x -= paddleMovement;
      if (player.moveRight)
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
