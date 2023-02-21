enum GameMode {
  NORMAL = "ModeNormal",
  FREEMOVE = "ModeFreeMove",
  POWERUP = "ModePowerUp",
  FIESTA = "ModeFiesta",
}

enum CoordinateDefinitions {
  X,
  Y,
};

enum PlayerDefinitions {
  PLAYER1,
  PLAYER2,
}

class Player {
  constructor(id: number, side: PlayerDefinitions) {
    this.userId = id
    if (side == PlayerDefinitions.PLAYER1) {
      this.batXY[CoordinateDefinitions.X] = 0 // temp values -- make variable depending on map size?
      this.batXY[CoordinateDefinitions.Y] = 100
    }
    else {
      this.batXY[CoordinateDefinitions.X] = 200
      this.batXY[CoordinateDefinitions.Y] = 100
    }
  }

  userId: number;
  batXY: number[];
  acceleration: number = 1;
  moveUp: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;
}

class GameData {
  gameID: number;
  players: Player[] = null;
  spectators: number[] = null;
  mapSize: number[] = [200, 200];
  mode: GameMode = GameMode.NORMAL;
  score: number[] = [0, 0];
  texturePath: string = null;
  ballPosition: number[];
  ballDirection: number[] = [0, 1];
  ballAcceleration: number = 1;
  hitsSinceLastGoal: number = 0;
  pointsToWin: number = 5;
  isFinished: boolean = false;

  webSocketPath: string; // how to store what socket is used?
}

class GameService {
  private games: GameData[] = null;
  private gamesPlayed: number = 0;

  updateGames() {
    if (this.games.length == 0)
      return

    for (let index = 0; index < this.games.length; index++) {
      const game = this.games[index];

    // game loop/logic

      this.sendGameInfo(this.games[index])
    }
    this.removeFinishedGames()
  }

  createGame(player1: number, player2: number, mode: GameMode, path: string) {
    const newGame = new GameData

    newGame.gameID = this.gamesPlayed;
    newGame.players.push(new Player(player1, PlayerDefinitions.PLAYER1))
    newGame.players.push(new Player(player2, PlayerDefinitions.PLAYER2))
    newGame.mode = mode
    newGame.webSocketPath = path
    this.games.push(newGame)
    this.gamesPlayed++
  }

  private removeFinishedGames() {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].isFinished) {
        this.storeGameInfo(this.games[index])		
        this.games.splice(index, 1)
      }
    }
  }

  private storeGameInfo(game: GameData) {
    // store game info into database
  }

  addSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID == gameID) {
        this.games[index].spectators.push(spectator)
        break
      }
    }
  }

  removeSpectator(spectator: number, gameID: number) {
    for (let index = 0; index < this.games.length; index++) {
      if (this.games[index].gameID == gameID) {
        const indexOfSpectator = this.games[index].spectators.indexOf(spectator)
        this.games[index].spectators.splice(indexOfSpectator, 1)
        break
      }
    }
  }

  private sendGameInfo(game: GameData) {
    // send current game state back through socket
  }
}
