import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Game } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { CurrentGameState, GameService } from './game.service';

enum GameMode {
  NORMAL = "ModeNormal",
  FREEMOVE = "ModeFreeMove",
  POWERUP = "ModePowerUp",
  FIESTA = "ModeFiesta",
}

// class Player {
//   userId: number;
//   batXY: number[];
//   score: number;
//   acceleration: number;
// }

// // const ball: {x: number, y: number, speed: number, Xvelocity: number, Yvelocity: number, rad: number} = {
// //   x: 1000/2,
// //   y: 600/2,
// //   speed: 5,
// //   Xvelocity: 5,
// //   Yvelocity: 5,
// //   rad: 20,
// // }

// // const plat: {x: number, y: number, height: number, width: number, score:number} = {
// //   x: canvas.width - 20,
// //   y: 600 / 2 - 25,
// //   height: 100,
// //   width: 20,
// //   score: 0
// // }

// // const other: {x: number, y: number, height: number, width: number, score:number} = {
// //   x: 0,
// //   y : 600 / 2 - 25,
// //   height: 100,
// //   width: 20,
// //   score: 0
// // }

// class GameData {
//   ball: number[] = [500, 300];
//   paddle1:  number[] = [0, 250];
//   paddle2:  number[] = [980, 250];
//   score:    number[] = [0, 0];
//   constructor() {
//     this.ball = [500, 300];
//     this.paddle1 = [0, 250];
//     this.paddle2 = [980, 250];
//     this.score = [0, 0];
//   }
// }

// class Games {
//   player: Player[];
//   watchers: number[];
//   mapsize: number[];
//   mode: GameMode;
//   texturePath: string;
//   data: GameData;
//   constructor() {
//     this.data = new GameData();
//     this.texturePath = 'undefined';
//     this.mode = GameMode.NORMAL;
// }
// }

// // this is a temporary solution to get a gamedata object to test with
// const game = new GameData();

// const ball: {x: number, y: number, speed: number, Xvelocity: number, Yvelocity: number, rad: number} = {
//   x: 1000/2,
//   y: 600/2,
//   speed: 5,
//   Xvelocity: 5,
//   Yvelocity: 5,
//   rad: 20,
// };

// const plat: {x: number, y: number, height: number, width: number, score:number} = {
//   x: 1000 - 20,
//   y: 600 / 2 - 25,
//   height: 100,
//   width: 20,
//   score: 0
// };

// const other: {x: number, y: number, height: number, width: number, score:number} = {
//   x: 0,
//   y : 600 / 2 - 25,
//   height: 100,
//   width: 20,
//   score: 0
// };

// function scored()
// {
//   game.ball[0] = 1000/2;
//   game.ball[1] = 600/2;
//   ball.Xvelocity = -ball.Xvelocity;
//   ball.speed = 5;
// }



// // function movePlat(e: KeyboardEvent)
// // {
// //   if (e.key === 'ArrowDown')
// //     if (plat.y < 600 - plat.height)
// //       plat.y += 30;
// //   if (e.key === 'ArrowUp')
// //     if (plat.y > 0)
// //       plat.y -= 30;
// //   // var name = e.key;
// //   // var code = e.code;
// //   // // Alert the key name and key code on keydown
// //   // alert(`Key pressed ${name} \r\n Key code value: ${code}`);
// // }

// function update(game:GameData)
// {
//   // change the score of players, if the ball goes to the left "game.ball[0]<0" computer win, else if "game.ball[0] > 1000" the user win
//   if(game.ball[0] + ball.rad > 1000){
//     game.score[0]++;
//     // comScore.play();
//     scored();
//   }else if(game.ball[0] - ball.rad < 0){
//     game.score[1]++;
//     // userScore.play();
//     scored();
//   }
//   //resetball

//   game.ball[0] += ball.Xvelocity;
//   game.ball[1] += ball.Yvelocity;
//   // console.log(game.ball[0]);
//   if (game.ball[1] + ball.rad > 600 || game.ball[1] - ball.rad < 0){
//     ball.Yvelocity = -ball.Yvelocity;
//     // wall.play();
//   }
//   // var collision: boolean = false;
//   // we check if the paddle hit the user or the com paddle
//   var player : {x: number, y: number, height: number, width: number, score:number} = (game.ball[0] + ball.rad < 1000/2) ? other : plat;
//   //if there is a collision
//   if (player.x < game.ball[0] + ball.rad && player.y < game.ball[1] + ball.rad && player.x + player.width > game.ball[0] - ball.rad && player.y + player.height > game.ball[1] - ball.rad)
//   {
//     // where the ball hits the plateau & normalize
//     var collisionPoint:number = ((game.ball[1] - (player.y + player.height/2))) / (player.height/2);
//     // from -45degrees to +45degrees
//     // Math.PI/4 = 45degrees
//     var angleRad: number = (Math.PI/4) * collisionPoint;
//     // change X & Y velocity dir
//     var dir:number= (game.ball[0] + ball.rad < 1000/2) ? 1 : -1;
//     ball.Xvelocity = dir * ball.speed * Math.cos(angleRad);
//     ball.Yvelocity = ball.speed * Math.sin(angleRad);
    
//     // speed up the ball everytime a paddle hits it.
//     ball.speed += 0.1;
//   }
// }

// function rubenpong(game: GameData)
// {
//   update(game);
// }
// private updatePaddles(game: GameData) {
//   for (let index = 0; index < game.players.length; index++) {
//     const player:Player = game.players[index];
//     const paddleMovement:number = player.paddle.acceleration * MoveSpeedPerTick.PADDLE;

//     // Get new y coordinate of paddle
//     if (player.moveUp)
//       player.paddle.y -= paddleMovement;
//     if (player.moveDown)
//       player.paddle.y += paddleMovement;

//     // Check if paddle goes out of bounds
//     if (player.paddle.y > 0)
//       player.paddle.y = 0;
//     else if (player.paddle.y + player.paddle.height > MapSize.HEIGHT)
//       player.paddle.y = MapSize.HEIGHT - player.paddle.height;
//   }
// }
enum PaddleInput {
  UP = "KeyUp",
  DOWN = "KeyDown",
  LEFT = "KeyLeft",
  RIGHT = "KeyRight",
}



// function SEND(){
//   this.server.emit('pos', this.games[0].data);
// }

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  // private games:  Games[] = [];
  private gameService: GameService;
  private currGameState: CurrentGameState;

  afterInit(server: Server) {
    this.server = server;
    // this.games.push(new Games());
    this.gameService = new GameService(this.server);
    this.gameService.createGame(1, 2, GameMode.NORMAL);
    // console.log(this.gameService.updateGames);

  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // await rubenpong();
    const fps: number = 60;
    setInterval(this.gameService.updateGames, 1000/fps);
    // client.emit('pos', this.games[0].data);  // magic
    client.emit('init'); // new connection
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('up')
  handleUp(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

  @SubscribeMessage('pos')
  handlePos(client: any, payload: any) {
    // this.currGameState = new C
    // console.log('Received payload:', payload);
    // await rubenpong();
    // setInterval(rubenpong, 1000/60);
    // setInterval(rubenpong, 1000/fps);
    // setInterval(this.gameService.updateGames, 1000/60);
    // setInterval(SEND,fps);

    this.server.emit('pos', this.currGameState);  // magic
  }

  @SubscribeMessage('keyDown')
  handleKeyDown(client: any, payload: any) {
    // console.log('Received payload:', payload);
    // return 'Server says hello!';
    this.gameService.UpdatePlayerInput(1, PaddleInput.DOWN); // magic 
  }
  // @SubscribeMessage('start')
  // onStart(client: Socket): void {
  //   try {
  //     if (!client.data.user) return;

  //     const player: Player = this.roomService.getPlayer(client.data.user.id);
  //     if (!player || !player.room) return;

  //     this.roomService.startCalc(player.room);
  //   } catch {}
  // }
  @SubscribeMessage('down')
  handleDown(client: any, payload: any): string {
    console.log('Received payload:', payload);
    return 'Server says hello!';
  }

}
