import { Injectable } from '@nestjs/common';
import { PrismaGameService } from './prisma/prismaGame.service';
import { Server } from 'socket.io';

export enum GameMode {
  NORMAL = 'Normal',
  FREEMOVE = 'FreeMove',
  POWERUP = 'PowerUp',
  FIESTA = 'Fiesta',
}

enum PaddleInput {
  UP = 'KeyUp',
  DOWN = 'KeyDown',
  LEFT = 'KeyLeft',
  RIGHT = 'KeyRight',
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
  BALL = 3,
}

enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
}

class Paddle {
  x: number = 0;
  y: number = 0;
  width: number = DefaultElementSize.PADDLEWIDTH;
  height: number = DefaultElementSize.PADDLEHEIGHT;
  acceleration: number = 1;
}

class Player {
  constructor(id: number, side: PlayerDefinitions) {
    this.paddle = new Paddle;
    this.userId = id;
    if (side === PlayerDefinitions.PLAYER1) {
      this.paddle.x = 0;
      this.paddle.y = MapSize.HEIGHT / 2 - DefaultElementSize.PADDLEHEIGHT / 2;
    }
    else {
      this.paddle.x = MapSize.WIDTH - DefaultElementSize.PADDLEWIDTH;
      this.paddle.y = MapSize.HEIGHT / 2 - DefaultElementSize.PADDLEHEIGHT / 2;
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
  x: number = MapSize.WIDTH / 2;
  y: number = MapSize.HEIGHT / 2;
  xDirection: number = (getRandomInt(10) % 2) ? (1.0 * MoveSpeedPerTick.BALL) : (-1.0 * MoveSpeedPerTick.BALL);
  yDirection: number = 0;
  acceleration: number = 1;
  radius: number = 20;
}

class GameData {
  gameID: number;
  players: Player[] = [];
  spectators: number[] = [];
  mapSize: number[] = [MapSize.WIDTH, MapSize.HEIGHT];
  mode: GameMode = GameMode.NORMAL;
  score: number[] = [0, 0];
  texturePath: string = null;
  pointsToWin: number = 5;
  isFinished: boolean = false;
  ball: Ball;
}

export class CurrentGameState {
  constructor (score: number[],
    leftPaddleCoords: number[], leftPaddleHeight: number, leftPaddleWidth: number,
    rightPaddleCoords: number[], rightPaddleHeight:number, rightPaddleWidth: number,
    ballCoords: number[],
    ballRadius: number) {
    this.score = score;
    this.leftPaddleCoords = leftPaddleCoords;
    this.leftPaddleHeight = leftPaddleHeight;
    this.leftPaddleWidth = leftPaddleWidth;
    this.rightPaddleCoords = rightPaddleCoords;
    this.rightPaddleHeight = rightPaddleHeight;
    this.rightPaddleWidth = rightPaddleWidth;
    this.ballCoords = ballCoords;
    this.ballRadius = ballRadius;
  }

  score:number[] = [0, 0];
  leftPaddleCoords: number[] = [0, MapSize.HEIGHT / 2];
  leftPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  leftPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  rightPaddleCoords: number[] = [MapSize.WIDTH, MapSize.HEIGHT / 2];
  rightPaddleHeight: number = DefaultElementSize.PADDLEHEIGHT;
  rightPaddleWidth: number = DefaultElementSize.PADDLEWIDTH;
  ballCoords: number[] = [MapSize.WIDTH / 2, MapSize.HEIGHT / 2];
  ballRadius: number = DefaultElementSize.BALLRADIUS;
}

@Injectable()
export class GameService {
  constructor(private prismaGameService: PrismaGameService) {
  }

  private games: GameData[] = [];
  private gamesPlayed: number = 0;
  private server: Server;

  setSocket(socket: Server) {
    this.server = socket;
  }

  updateGames() {
    if (this.games === undefined || this.games.length === 0) {
      return;
    }

    for (let index = 0; index < this.games.length; index++) {
      this.updatePaddles(this.games[index]);
      this.updateBall(this.games[index]);
      this.sendGameInfo(this.games[index]);
    }
    this.removeFinishedGames(); // Don't do this every game tick
  }

  private updatePaddles(game: GameData) {
    for (let playerNbr = 0; playerNbr < 2; playerNbr++) {
      const player:Player = game.players[playerNbr];
      const paddleMovement:number = player.paddle.acceleration * MoveSpeedPerTick.PADDLE;

      // Get new y coordinate of paddle
      if (player.moveUp)
        player.paddle.y -= paddleMovement;
      if (player.moveDown)
        player.paddle.y += paddleMovement;

      // Check if paddle goes out of bounds
      if (player.paddle.y < 0)
        player.paddle.y = 0;
      else if (player.paddle.y + player.paddle.height > MapSize.HEIGHT)
        player.paddle.y = MapSize.HEIGHT - player.paddle.height;

      if (game.mode === GameMode.FREEMOVE || game.mode === GameMode.FIESTA) {
        if (player.moveLeft)
          player.paddle.x -= paddleMovement;
        if (player.moveRight)
          player.paddle.x += paddleMovement;

        // Out of bounds check for both sides of the map depending on the player's side
        if (playerNbr === PlayerDefinitions.PLAYER1) {
          if (player.paddle.x + player.paddle.width > MapSize.WIDTH / 2 - DefaultElementSize.PADDLEWIDTH * 5)
            player.paddle.x = MapSize.WIDTH / 2 - player.paddle.width - DefaultElementSize.PADDLEWIDTH * 5;
          if (player.paddle.x < 0)
            player.paddle.x = 0;
        }
        else if (playerNbr === PlayerDefinitions.PLAYER2) {
          if (player.paddle.x + player.paddle.width < MapSize.WIDTH / 2 + DefaultElementSize.PADDLEWIDTH * 5)
            player.paddle.x = MapSize.WIDTH / 2 + player.paddle.width + DefaultElementSize.PADDLEWIDTH * 5;
          if (player.paddle.x + player.paddle.width > MapSize.WIDTH )
            player.paddle.x = MapSize.WIDTH - player.paddle.width;
        }
      }
    }
  }

  private updateBall(game: GameData) {
    const ball = game.ball;
    let paddle: Paddle;

    // check what side of the map the ball is on and which paddle to check collision for
    if (game.ball.x + ball.radius < MapSize.WIDTH / 2)
      paddle = game.players[PlayerDefinitions.PLAYER1].paddle;
    else
      paddle = game.players[PlayerDefinitions.PLAYER2].paddle;

    // Update ball position
    ball.x += ball.xDirection;
    ball.y += ball.yDirection;

    // check if ball hits the top or bottom of the map then invert it's y direction
    if (ball.y + ball.radius > MapSize.HEIGHT || ball.y - ball.radius < 0)
      ball.yDirection -= ball.yDirection * 2;

    if (this.ballPaddleCollision(ball, paddle)) {
      let speed = ball.acceleration * MoveSpeedPerTick.BALL;
      const collisionPoint = ball.y - (paddle.y + paddle.height / 2); // gets a point on the paddle that has a value between the paddle's height / 2 and negative paddle's height / 2
      const normalizedCollisionPoint = collisionPoint / paddle.height / 2; // sets the entire length of the paddle's collision points to be between -1 and 1
      const returnAngle = Math.PI / 4 * normalizedCollisionPoint; // 45 degrees (Pi / 4) times the normalized paddle collision point which is between 1 and -1
      const returnDirection = (ball.x + ball.radius < MapSize.WIDTH / 2) ? 1 : -1;

      // prevent ball from moving through paddle
      if (speed > DefaultElementSize.PADDLEWIDTH)
        speed = DefaultElementSize.PADDLEWIDTH - 1;
      ball.xDirection = returnDirection * speed * Math.cos(returnAngle); // cos gets the value between the ball and the x angle
      ball.yDirection = speed * Math.sin(returnAngle); // sin gets the value between the ball and the y angle

      // update the ball's acceleration after every paddle hit
      ball.acceleration += 0.1;
    }

    // Check if the ball has hit the score line
    if (ball.x - ball.radius < 0)
      this.scored(game, PlayerDefinitions.PLAYER2);
    else if (ball.x + ball.radius > MapSize.WIDTH)
      this.scored(game, PlayerDefinitions.PLAYER1);
  
    if (game.isFinished) // use this for temporary debugging
      this.resetGame(game);
  }

  private resetGame(game: GameData) {
    game.ball.x = MapSize.WIDTH / 2;
    game.ball.y = MapSize.HEIGHT / 2;
    game.ball.radius = DefaultElementSize.BALLRADIUS;
    game.score = [0, 0];
    game.isFinished = false;
  }

  private ballPaddleCollision(ball: Ball, paddle: Paddle) {
    // temporary variables to set edges for testing
    let tempX: number = ball.x;
    let tempY: number = ball.y;
    
    // sets the closest edges into the temp variables
    // compare to left or right edges
    if (ball.x <= paddle.x)
      tempX = paddle.x;
    else if (ball.x > paddle.x + paddle.width)
      tempX = paddle.x + paddle.width;

    // compare to top or bottom edge
    if (ball.y <= paddle.y)
      tempY = paddle.y;
    else if (ball.y > paddle.y + paddle.height)
      tempY = paddle.y + paddle.height;

    // get distance from closest edges
    const distX: number = ball.x - tempX;
    const distY: number = ball.y - tempY;
    const distance: number = Math.sqrt((distX * distX) + (distY * distY));
  
    // if the distance is less than or equal to the radius there is a collision
    if (distance <= ball.radius)
      return true;
    return false;
  }

  private scored(game: GameData, player: PlayerDefinitions) {
    const ball = game.ball;

    if (player === PlayerDefinitions.PLAYER1)
      game.score[PlayerDefinitions.PLAYER1]++;
    else
      game.score[PlayerDefinitions.PLAYER2]++;

    if (game.score[PlayerDefinitions.PLAYER1] === game.pointsToWin ||
        game.score[PlayerDefinitions.PLAYER2] === game.pointsToWin)
      game.isFinished = true;
    ball.x = MapSize.WIDTH / 2;
    ball.y = MapSize.HEIGHT / 2;
    ball.xDirection = (getRandomInt(100) % 2) ? (1.0 * MoveSpeedPerTick.BALL) : (-1.0 * MoveSpeedPerTick.BALL);
    ball.yDirection = 0.0;
    ball.acceleration = 1;
  }

  createGame(player1: number, player2: number, mode: GameMode) {
    const newGame = new GameData;

    newGame.gameID = this.gamesPlayed;
    newGame.players.push(new Player(player1, PlayerDefinitions.PLAYER1));
    newGame.players.push(new Player(player2, PlayerDefinitions.PLAYER2));
    newGame.ball = new Ball();
    newGame.mode = mode;
    this.games.push(newGame);
    this.gamesPlayed++;
  }

  logGames() {
    console.log('\n\nLogging games:');
    console.log(this.games);
  }

  private removeFinishedGames() {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].isFinished) {
        this.storeGameInfo(this.games[index]);
        this.games.splice(index, 1);
        index--; // is this necessary ??
      }
    }
  }

  private storeGameInfo(game: GameData) {
    this.prismaGameService.createGame({
      score: game.score,
      players: {
        connect: [{
          id: game.players[PlayerDefinitions.PLAYER1].userId
        },
        {
          id: game.players[PlayerDefinitions.PLAYER2].userId
        }],
      }
    });
  }

  addSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID === gameID) {
        if (this.games[index].isFinished) {
          // send info back that game is already finished
          return;
        }
        this.games[index].spectators.push(spectator);
        return;
      }
    }
    // send info back that game is already finished
  }

  removeSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID === gameID) {
        const indexOfSpectator = this.games[index].spectators.indexOf(spectator);

        if (indexOfSpectator === -1)
          return;

        this.games[index].spectators.splice(indexOfSpectator, 1);
        return;
      }
    }
  }

  private sendGameInfo(game: GameData) {
    const player1 = game.players[PlayerDefinitions.PLAYER1];
    const player2 = game.players[PlayerDefinitions.PLAYER2];
    const toSend = new CurrentGameState(game.score,
      [player1.paddle.x, player1.paddle.y], player1.paddle.height, player1.paddle.width,
      [player2.paddle.x, player2.paddle.y], player2.paddle.height, player2.paddle.width,
      [game.ball.x, game.ball.y], game.ball.radius);

    // send current game state back through socket
    this.server.emit('pos', toSend);
    // console.log(toSend);
  }
  
  UpdatePlayerInput(playerId: number, input: PaddleInput) {
    for (let index = 0; index < this.games.length; index++) { // make this faster, store all players inside an array?
      const games = this.games[index];

      for (let index = 0; index < games.players.length; index++) {
        const player = games.players[index];

        // enables / disables the current move input
        if (player.userId === playerId) {
          if (input === PaddleInput.DOWN)
            player.moveDown = player.moveDown ? false : true;
          else if (input === PaddleInput.UP)
            player.moveUp = player.moveUp ? false : true;
          else if (input === PaddleInput.LEFT)
            player.moveLeft = player.moveLeft ? false : true;
          else if (input === PaddleInput.RIGHT)
            player.moveRight = player.moveRight ? false : true;
          return;
        }
      }
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
