enum GameMode {
  NORMAL = "ModeNormal",
  FREEMOVE = "ModeFreeMove",
  POWERUP = "ModePowerUp",
  FIESTA = "ModeFiesta",
}

enum PlayerDefinitions {
  PLAYER1,
  PLAYER2,
}

enum MapSize {
  WIDTH = 1000,
  HEIGHT = 600,
}

enum MoveSpeedPerTick {
  PADDLE = 2,
  BALL = 5,
}

enum ElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
}

class Paddle {
  x: number = 0;
  y: number = 0;
  acceleration: number = 1;
}

class Player {
  constructor(id: number, side: PlayerDefinitions) {
    this.userId = id
    if (side == PlayerDefinitions.PLAYER1) {
      this.paddle.x = 0
      this.paddle.y = MapSize.HEIGHT / 2
    }
    else {
      this.paddle.x = MapSize.WIDTH
      this.paddle.y = MapSize.HEIGHT / 2
    }
  }

  userId: number;
  paddle: Paddle;
  moveUp: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;
}

class Ball {
  xPos: number = MapSize.WIDTH / 2;
  yPos: number = MapSize.HEIGHT / 2;
  xDir: number = (getRandomInt(100) % 2) ? 1.0 : -1.0;
  yDir: number = 0;
  acceleration: number = 1;
}

class GameData {
  gameID: number;
  players: Player[] = null;
  spectators: number[] = null;
  mapSize: number[] = [MapSize.WIDTH, MapSize.HEIGHT];
  mode: GameMode = GameMode.NORMAL;
  score: number[] = [0, 0];
  texturePath: string = null;
  pointsToWin: number = 5;
  isFinished: boolean = false;
  ball: Ball;
}

export class GameService {
  private games: GameData[] = null;
  private gamesPlayed: number = 0;

  updateGames() {
    if (this.games.length == 0)
      return

    for (let index = 0; index < this.games.length; index++) {
      this.updatePaddles(index)
      this.updateBall(index)
      this.sendGameInfo(this.games[index])
    }
    this.removeFinishedGames()
  }

  private updatePaddles(gameIndex: number) {
    const game = this.games[gameIndex];

    for (let index = 0; index < game.players.length; index++) {
      const player = game.players[index];
      const paddleMovement = player.paddle.acceleration * MoveSpeedPerTick.PADDLE;
      // let   newX; Implement later
      let   newY;

      // Get new y coordinate of paddle
      if (player.moveUp && player.moveDown)
        newY = player.paddle.y;
      else if (player.moveUp)
        newY = player.paddle.y - paddleMovement;
      else if (player.moveDown)
        newY = player.paddle.y + paddleMovement;

      // Check if paddle goes out of bounds
      if (newY >= 0)
        newY = 0;
      else if (newY + ElementSize.PADDLEHEIGHT >= MapSize.HEIGHT)
        newY = MapSize.HEIGHT - ElementSize.PADDLEHEIGHT;
      
      // Assign new y coordinate
      player.paddle.y = newY;
    }
  }

  private updateBall(gameIndex: number) {
    const game = this.games[gameIndex];

    for (let index = 0; index < game.players.length; index++) {
      const player = game.players[index];
      const ballMovement = game.ball.acceleration * MoveSpeedPerTick.BALL;

    }
    if (game.ball.xPos - ElementSize.BALLRADIUS < 0)
      this.scored(gameIndex, PlayerDefinitions.PLAYER2)
    else if (game.ball.xPos + ElementSize.BALLRADIUS > MapSize.WIDTH)
      this.scored(gameIndex, PlayerDefinitions.PLAYER1)
  }

  private scored(gameIndex: number, player: PlayerDefinitions) {
    const game = this.games[gameIndex];

    if (player == PlayerDefinitions.PLAYER1)
      game.score[PlayerDefinitions.PLAYER1]++
    else
      game.score[PlayerDefinitions.PLAYER2]++

    if (game.score[PlayerDefinitions.PLAYER1] == game.pointsToWin ||
        game.score[PlayerDefinitions.PLAYER2] == game.pointsToWin)
        game.isFinished = true;
      game.ball.xPos = MapSize.WIDTH / 2;
      game.ball.yPos = MapSize.HEIGHT / 2;
      game.ball.acceleration = 1;
      game.ball.xDir = (getRandomInt(100) % 2) ? 1.0 : -1.0;
      game.ball.yDir = 0.0;
  }

  createGame(player1: number, player2: number, mode: GameMode) {
    const newGame = new GameData

    newGame.gameID = this.gamesPlayed;
    newGame.players.push(new Player(player1, PlayerDefinitions.PLAYER1))
    newGame.players.push(new Player(player2, PlayerDefinitions.PLAYER2))
    newGame.mode = mode
    this.games.push(newGame)
    this.gamesPlayed++
  }

  private removeFinishedGames() {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].isFinished) {
        this.storeGameInfo(this.games[index])		
        this.games.splice(index, 1)
        index-- // is this necessary ??
      }
    }
  }

  private storeGameInfo(game: GameData) {
    // store game info into database
  }

  addSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID == gameID) {
        if (this.games[index].isFinished) { // send info back that game is already finished
          return
        }
      this.games[index].spectators.push(spectator)
      return
      }
    }
    // send info back that game is already finished
  }

  removeSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID == gameID) {
        const indexOfSpectator = this.games[index].spectators.indexOf(spectator)
        this.games[index].spectators.splice(indexOfSpectator, 1)
        return
      }
    }
  }

  private sendGameInfo(game: GameData) {
    // send current game state back through socket
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
