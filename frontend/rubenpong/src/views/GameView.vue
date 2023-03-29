<script setup lang="ts">
</script>

<template>
  <div class="item">
    <div style="text-align: center">
      <div v-if="!matched">
        <h1 class="text-4xl p-16">
          Wanna Match? ;)
        </h1>
        <div>
          <button
            v-if="!selectGameMode"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            @click="selectGameMode = true"
          >
            <font-awesome-icon icon="play" /> Play game
          </button>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="createGame('ModeNormal')"
            >
              NORMAL
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="createGame('ModeFreeMove')"
            >
              FREEMOVE
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="createGame('ModePowerUp')"
            >
              POWERUP
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="createGame('ModeFiesta')"
            >
              FIESTA
            </button>
          </div>
        </div>
      </div>
      <div class="p-16">
        <canvas
          id="pixels"
          class="canvas"
          width="1000"
          height="600"
          style="border:0px solid #CCCCCC;"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import io from 'socket.io-client';
export default {

  data()
  {
    return {
      selectGameMode: false,
      matched: false,
      gameMode : ''
    };
  },
  mounted() {
    var canvas: HTMLCanvasElement = document.getElementById('pixels') as HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const socket: any = io('http://localhost:3000/game');
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

enum MapSize {
  WIDTH = 1000,
  HEIGHT = 600,
}
enum DefaultElementSize {
  PADDLEWIDTH = 20,
  PADDLEHEIGHT = 100,
  BALLRADIUS = 20,
}
class CurrentGameState {
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
let gameMode: string = '';
const waitForElement = () =>{
  // let newGameMode = this.gameMode;
  if(this.gameMode !== ''){
    gameMode = this.gameMode;
    const packet = {gameMode: gameMode};
    console.log(gameMode);
    socket.emit('changeGameMode', packet);
    socket.on('pos', (data: any) => {
      const datas: CurrentGameState = data;
      //draw background
      if (this.matched)
      {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (datas.score[1] >= 5 || datas.score[0] >= 5 )
        {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          if (datas.score[1] >= 5 )
          {
            ctx.fillText('You lost!', canvas.width / 2 - 100, canvas.height / 2);
            return ;
          }
          if (datas.score[0] >= 5 )
          {
            ctx.fillText('You won!', canvas.width / 2 - 100, canvas.height / 2);
            return ;
          }
        }
        else {
          //draw plateau player 1
          ctx.fillStyle = 'white';
          ctx.fillRect(datas.leftPaddleCoords[0], datas.leftPaddleCoords[1], datas.leftPaddleWidth, datas.leftPaddleHeight);
      
          //draw plateau player 2
          ctx.fillStyle = 'white';
          ctx.fillRect(datas.rightPaddleCoords[0], datas.rightPaddleCoords[1], datas.rightPaddleWidth, datas.rightPaddleHeight);
      
          //draw ball
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(datas.ballCoords[0], datas.ballCoords[1], datas.ballRadius, 0, Math.PI * 2, false);
          ctx.closePath();
          ctx.fill();
      
          //draw text player 1
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText('Player 1', canvas.width / 4, canvas.height / 8);
    
          //draw text score player 1
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText(datas.score[0].toString(), canvas.width / 4 + 40, canvas.height / 4);
      
          //draw text player 2
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText('Player 2', canvas.width / 4 * 3 - 100, canvas.height / 8);
      
          //draw text score player 2
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText(datas.score[1].toString(), canvas.width / 4 * 3 - 70, canvas.height / 4);
      
          //draw net
          for(let i = 0; i <= canvas.height; i+=15){
            ctx.fillStyle = 'white';
            ctx.fillRect(canvas.width / 2 - 1.5 , i, 3, 10);
          }
        }
      }
    });
  }
  else{
    setTimeout(waitForElement, 250);
  }
};
setTimeout(waitForElement, 250);

var arrowUp: Boolean = false;
var arrowDown: Boolean = false;
var arrowLeft: Boolean = false;
var arrowRight: Boolean = false;
function movePlat(e: KeyboardEvent)
{
  if (!arrowDown)
  {
    if (e.key === 'ArrowDown')
    {
      socket.emit('ArrowDown');
      arrowDown = true;
    }
  }
  if (!arrowUp)
  {
    if (e.key === 'ArrowUp')
    {
      socket.emit('ArrowUp');
      arrowUp = true;
    }
  }
  if (!arrowRight)
  {
    if (e.key === 'ArrowRight')
    {
      socket.emit('ArrowRight');
      arrowRight = true;
    }
  }
  if (!arrowLeft)
  {
    if (e.key === 'ArrowLeft')
    {
      socket.emit('ArrowLeft');
      arrowLeft = true;
    }
  }
}

function stopMovePlat(e: KeyboardEvent)
{
  if (e.key === 'ArrowDown')
  {
    socket.emit('ArrowDown');
    arrowDown = false;
  }
  if (e.key === 'ArrowUp')
  {
    socket.emit('ArrowUp');
    arrowUp = false;
  }
  if (e.key === 'ArrowRight')
  {
    socket.emit('ArrowRight');
    arrowRight = false;
  }
  if (e.key === 'ArrowLeft')
  {
    socket.emit('ArrowLeft');
    arrowLeft = false;
  }
}

document.addEventListener('keydown', movePlat);
document.addEventListener('keyup', stopMovePlat);

    //start of game define which plat - b / f?
    //update() function in backend
    //position plat, ball and player in backend?
    //powerups
  },
  methods: {
    createGame(gameMode:string)
    {
      this.gameMode = gameMode;
      this.matched = true;
    }
  },
};
</script>

<style scoped>
.canvas {
    padding: 0;
    margin: auto;
    display: block;
    width: 800px;
}
</style>
