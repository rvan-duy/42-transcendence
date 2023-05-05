import { GameMode, PaddleInput, PlayerDefinitions, MapSize, MoveSpeedPerTick, DefaultElementSize, BallStatus } from './game.definitions';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaGameService } from './prisma/prismaGame.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { Player } from './game.player';
import { Ball } from './game.ball';
import { PowerUp } from './game.powerup';
import { Socket } from 'socket.io';
import { GateService } from 'src/gate/gate.service';

export class GameData {
  gameID: number;
  players: Player[] = [];
  spectators: number[] = [];
  mapSize: number[] = [MapSize.WIDTH, MapSize.HEIGHT];
  mode: GameMode = GameMode.NORMAL;
  score: number[] = [0, 0];
  texturePath: string = null;
  pointsToWin: number = 5;
  isFinished: Boolean = false;
  powerUpOnField: Boolean = false;
  powerUp: PowerUp;
  ball: Ball;
  server: Server;

  emitToRoom(path: string, payload: any) {
    this.server.to(`game_${this.gameID}`).emit(path, payload);
    // this.server.emit(`${path}_${this.gameID}`, payload);
  }
}

export class CurrentGameState {
  constructor (score: number[],
    leftPaddleCoords: number[], leftPaddleHeight: number, leftPaddleWidth: number,
    rightPaddleCoords: number[], rightPaddleHeight:number, rightPaddleWidth: number,
    ballCoords: number[], ballRadius: number,
    powerUpOnField: Boolean, powerUpcoords: number[], powerUpRadius: number) {
    this.score = score;
    this.leftPaddleCoords = leftPaddleCoords;
    this.leftPaddleHeight = leftPaddleHeight;
    this.leftPaddleWidth = leftPaddleWidth;
    this.rightPaddleCoords = rightPaddleCoords;
    this.rightPaddleHeight = rightPaddleHeight;
    this.rightPaddleWidth = rightPaddleWidth;
    this.ballCoords = ballCoords;
    this.ballRadius = ballRadius;
    this.powerUpOnField = powerUpOnField;
    this.powerUpCoords = powerUpcoords;
    this.powerUpRadius = powerUpRadius;
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
  powerUpOnField: Boolean = false;
  powerUpCoords: number[] = [0, 0];
  powerUpRadius: number = 0;
}

@Injectable()
export class GameService {
  constructor(private readonly prismaGameService: PrismaGameService,
              private readonly prismaUserService: PrismaUserService,
              @Inject('gameGate') private readonly gameGate: GateService,
  ) {}

  private games: GameData[] = [];
  private gamesPlayed: number = 0;
  private server: Server;

  setSocket(socket: Server) {
    this.server = socket;
  }

  async updateGames() {
    if (this.games === undefined || this.games.length === 0) {
      return;
    }

    for (let index = 0; index < this.games.length; index++) {
      const ball: Ball = this.games[index].ball;
      const mode: GameMode = this.games[index].mode;
      const powerUp: PowerUp = this.games[index].powerUp;

      //update paddle positions
      this.updatePaddles(this.games[index]);

      // update ball position and checks for score
      if (ball.update(this.games[index]) === BallStatus.SCORED)
        await this.scored(this.games[index]);

      // updates the power-up if the right gamemode is selected
      if (mode === GameMode.POWERUP || mode === GameMode.FIESTA)
        powerUp.update(this.games[index]);

      // send the game state back to the players
      this.sendGameInfo(this.games[index]);
    }
    this.removeFinishedGames(); // Don't do this every game tick
  }

  private updatePaddles(game: GameData) {
    for (let playerNbr = 0; playerNbr < 2; playerNbr++) {
      const player:Player = game.players[playerNbr];
      player.paddle.update(player, playerNbr, game.mode);
    }
  }

  private async scored(game: GameData) {
    const ball = game.ball;
    let scoringPlayer: PlayerDefinitions;

    if (game.ball.x - game.ball.radius <= 0) {
      scoringPlayer = PlayerDefinitions.PLAYER2;
      game.score[scoringPlayer]++;
    }
    else {
      scoringPlayer = PlayerDefinitions.PLAYER1;
      game.score[scoringPlayer]++;
    }

    if (game.score[scoringPlayer] === game.pointsToWin ) {
      const winningPlayer: Player = game.players[scoringPlayer];

      game.isFinished = true;
      game.emitToRoom('Winner', winningPlayer.name);
      this.storeGameInfo(game, winningPlayer);
    }
    ball.x = MapSize.WIDTH / 2;
    ball.y = MapSize.HEIGHT / 2;
    ball.xDirection = (getRandomInt(100) % 2) ? (1.0 * MoveSpeedPerTick.BALL) : (-1.0 * MoveSpeedPerTick.BALL);
    ball.yDirection = 0.0;
    ball.acceleration = 1;
    if (game.mode === GameMode.POWERUP || game.mode === GameMode.FIESTA)
      game.powerUp.resetPowerUpState(game, false);
  }

  async createGame(player1: number, player2: number, mode: GameMode) {
    const newGame = new GameData;
    const dataPlayer1: User = await this.prismaUserService.user({ id: player1 });
    const dataPlayer2: User = await this.prismaUserService.user({ id: player2 });
                                                                                     
    newGame.gameID = this.gamesPlayed;
    newGame.players.push(new Player(dataPlayer1, PlayerDefinitions.PLAYER1));
    newGame.players.push(new Player(dataPlayer2, PlayerDefinitions.PLAYER2));
    newGame.ball = new Ball();
    newGame.powerUp = new PowerUp();
    newGame.mode = mode;
    newGame.server = this.server;
    this.games.push(newGame);
    this.gamesPlayed++;
    await this.joinUserToGameRoom(dataPlayer1.id, newGame.gameID);
    await this.joinUserToGameRoom(dataPlayer2.id, newGame.gameID);
    this.server.emit('GameCreated', {gameId: newGame.gameID,
      player1: player1, namePlayer1: dataPlayer1.name,
      player2: player2, namePlayer2: dataPlayer2.name});
  }

  logGames() {
    console.log('\n\nLogging games:', this.games);
  }

  private async removeFinishedGames() {
    for (let index = 0; index < this.games.length; index++) {
      const game: GameData = this.games[index];
      if (game.isFinished) {
        console.log(`removing game ${game.gameID}`);
        const userId1: number = game.players[0].userId;
        const userId2: number = game.players[1].userId;
        const socketsUser1: Socket[] = await this.gameGate.getSocketsByUser(userId1);
        const socketsUser2: Socket[] = await this.gameGate.getSocketsByUser(userId2);
        for (let index = 0; index < socketsUser1.length; index++) {
          const socket = socketsUser1[index];
          this.removeUserFromGameRoom(userId1, socket);
        }
        for (let index = 0; index < socketsUser2.length; index++) {
          const socket = socketsUser2[index];
          this.removeUserFromGameRoom(userId1, socket);
        }
        this.games.splice(index, 1);
        index--;
      }
    }
  }

  private storeGameInfo(game: GameData, winningPlayer: Player) {
    this.prismaGameService.createGame({
      score: game.score,
      players: {
        connect: [{
          id: game.players[PlayerDefinitions.PLAYER1].userId
        },
        {
          id: game.players[PlayerDefinitions.PLAYER2].userId
        }],
      },
      winnerId: winningPlayer.userId
    });
  }

  private sendGameInfo(game: GameData) {
    const player1 = game.players[PlayerDefinitions.PLAYER1];
    const player2 = game.players[PlayerDefinitions.PLAYER2];
    const toSend = new CurrentGameState(game.score,
      [player1.paddle.x, player1.paddle.y], player1.paddle.height, player1.paddle.width,
      [player2.paddle.x, player2.paddle.y], player2.paddle.height, player2.paddle.width,
      [game.ball.x, game.ball.y], game.ball.radius,
      game.powerUpOnField, [game.powerUp.x, game.powerUp.y], game.powerUp.radius);

    // send current game state back through socket
    if (!game.isFinished)
      game.emitToRoom('GameState', toSend);
    // console.log(toSend);
  }
  
  UpdatePlayerInput(playerId: number, gameId: number, input: PaddleInput, enabled: Boolean) {
    const game: GameData = this.getGameByGameId(gameId);

    if (game === null)
      return ;

    for (let index = 0; index < game.players.length; index++) {
      const player = game.players[index];

      if (player.userId === playerId) {
        if (enabled)
          player.enableInput(input);
        else
          player.disableInput(input);
        return;
      }
    }
  }

  isUserInGame(userId: number) {
    for (let index = 0; index < this.games.length; index++) {
      const game = this.games[index];

      for (let index = 0; index < game.players.length; index++) {
        const player = game.players[index];

        if (player.userId === userId)
          return (true);
      }
    }
    return (false);
  }

  checkIfPlaying(userId: number, client: Socket) {
    const powerUps: string[] = ['Paddle Slow', 'Paddle Speed', 'Ball Radius', 'Super Smash', 'Freeze'];
    const gameIndex: number = this.getGameIndexByUserId(userId);

    if (gameIndex === -1) {
      // there is no game where the userId is found in so we send back
      client.emit('GameStatus', {
        alreadyInGame: false,
        gameId: -1,
        gameMode: GameMode.UNMATCHED,
        namePlayer1: '',
        namePlayer2: '',
        powerUpActive: false,
        powerUp: '',
      });
      return ;
    }
    // there is a game where the user is playing so we send back all the game's details and join the client to the game's room
    const game: GameData = this.games[gameIndex];
    client.emit('GameStatus', {
      alreadyInGame: true,
      gameId: game.gameID,
      gameMode: game.mode,
      namePlayer1: game.players[0].name,
      namePlayer2: game.players[1].name,
      powerUpActive: game.powerUp.powerUpEnabled,
      powerUp: powerUps[game.powerUp.effect]
    });
    client.join(`game_${game.gameID}`);
  }

  private getGameIndexByUserId(userId: number) {
    for (let index = 0; index < this.games.length; index++) {
      const game: GameData = this.games[index];

      for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
        const player: Player = game.players[playerIndex];
        
        if (player.userId === userId)
          return (index);
      }
    }
    return (-1);
  }

  private getGameByGameId(gameId: number) {
    for (let index = 0; index < this.games.length; index++) {
      const game = this.games[index];
      if (game.gameID === gameId)
        return (game);
    }
    return (null);
  }

  async joinUserToGameRoom(userId: number, gameId: number) {
    const	userSockets = await this.gameGate.getSocketsByUser(userId);

    for (let index = 0; index < userSockets.length; index++) {
      userSockets[index].join(`game_${gameId}`);
    }
  }

  async joinUserToRoomIfPlaying(userId: number) {
    const gameIndex: number = this.getGameIndexByUserId(userId);

    if (gameIndex === -1)
      return ;
    
    await this.joinUserToGameRoom(userId, this.games[gameIndex].gameID);
  }

  removeUserFromGameRoom(userId: number, userSocket: Socket) {
    const gameIndex: number = this.getGameIndexByUserId(userId);
    
    if (gameIndex === -1)
      return ;
    const game: GameData = this.games[gameIndex];
    userSocket.leave(`game_${game.gameID}`);
  }

  resetUserInput(userId: number) {
    const gameIndex = this.getGameIndexByUserId(userId);

    if (gameIndex === -1)
      return ;
    const game = this.games[gameIndex];
    if (game.players[0].userId === userId)
      game.players[0].resetInput();
    else
      game.players[1].resetInput();
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
