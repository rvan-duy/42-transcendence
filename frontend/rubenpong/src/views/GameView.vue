
<script setup lang="ts">

</script>

<template>
  <div class="item">
    <div>
      <canvas
        id="pixels"
        width="1000"
        height="600"
        style="border:1px solid #CCCCCC;"
      />
    </div>
  </div>
</template>

<script lang="ts">
import io from 'socket.io-client';
// import CurrentGameState from 'game.service'
function increaseArraySize(inputArray: Uint8ClampedArray): Uint8ClampedArray {
  const outputArray = new Uint8ClampedArray(64);
  for (let i = 0; i < 64; i++) {
    outputArray[i] = inputArray[i % 4];
  }
  return outputArray;
}
export default {
  mounted() {
    var init: boolean = false;
    var canvas: HTMLCanvasElement = document.getElementById('pixels') as HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    var queue: ImageData[];
    const socket: any = io('http://localhost:3000/game');
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
 
		// class GameData {
    //   ball: number[] = [500, 300];
    //   paddle1:  number[] = [0, 275];
    //   paddle2:  number[] = [980, 275];
    //   score:    number[] = [0, 0];
    // }

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

socket.on('pos', (data: any) => {
        const datas: CurrentGameState = data;
        //draw background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        if (datas.score[1] >= 10 || datas.score[0] >= 10 )
        {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          if (datas.score[1] >= 10 )
            ctx.fillText('You won!', canvas.width / 2 - 100, canvas.height / 2);
          if (datas.score[0] >= 10 )
            ctx.fillText('You lost!', canvas.width /  2 - 100, canvas.height / 2);
        }
        //draw plateau other player
        else if (datas.score[1] < 10 || datas.score[0] < 10) {
          ctx.fillRect(datas.leftPaddleCoords[0], datas.leftPaddleCoords[1], datas.leftPaddleWidth, datas.leftPaddleHeight);
          //draw plateau you
          ctx.fillStyle = 'white';
          ctx.fillRect(datas.rightPaddleCoords[0], datas.rightPaddleCoords[1], datas.rightPaddleWidth, datas.rightPaddleHeight);
          //draw ball
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(datas.ballCoords[0], datas.ballCoords[1], datas.ballRadius, 0, Math.PI * 2, false);
          ctx.closePath();
          ctx.fill();
          //draw text
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText('other', canvas.width / 4, canvas.height / 8);
          //draw text
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText(datas.score[0].toString(), canvas.width / 4 + 40, canvas.height / 4);
          //draw text
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText('you', canvas.width / 4 * 3 - 100, canvas.height / 8);
          //draw text
          ctx.fillStyle = 'white';
          ctx.font = '50px arial';
          ctx.fillText(datas.score[1].toString(), canvas.width / 4 * 3 - 70, canvas.height / 4);
          //draw net
          for(let i = 0; i <= canvas.height; i+=15){
            ctx.fillStyle = 'white';
            ctx.fillRect(canvas.width / 2 - 1.5 , i, 3, 10);
          }
        }
      });

    // function render()
    // {
    //   socket.emit('pos');
    // }

    const ball: {x: number, y: number, speed: number, Xvelocity: number, Yvelocity: number, rad: number} = {
      x: canvas.width/2,
      y: canvas.height/2,
      speed: 5,
      Xvelocity: 5,
      Yvelocity: 5,
      rad: 20,
    };

    const plat: {x: number, y: number, height: number, width: number, score:number} = {
      x: canvas.width - DefaultElementSize.PADDLEWIDTH,
      y: canvas.height / 2 - DefaultElementSize.PADDLEHEIGHT / 2,
      height: 100,
      width: 20,
      score: 0
    };

    const other: {x: number, y: number, height: number, width: number, score:number} = {
		x: 0,
		y : canvas.height / 2 - DefaultElementSize.PADDLEHEIGHT / 2,
		height: 100,
		width: 20,
      score: 0
    };

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
          console.log(e.key);
          socket.emit('ArrowDown');
          arrowDown = true;
        }
      }
      if (!arrowUp)
      {
        if (e.key === 'ArrowUp')
        {
          console.log(e.key);
          socket.emit('ArrowUp');
          arrowUp = true;
        }
      }
      if (!arrowRight)
      {
        if (e.key === 'ArrowRight')
        {
          console.log(e.key);
          socket.emit('ArrowRight');
          arrowRight = true;
        }
      }
      if (!arrowLeft)
      {
        if (e.key === 'ArrowLeft')
        {
          console.log(e.key);
          socket.emit('ArrowLeft');
          arrowLeft = true;
        }
      }
    }

    function stopMovePlat(e: KeyboardEvent)
    {
      console.log ("keyup");
      console.log(e.key);
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

    // function rubenpong()
    // {
    //   render();
    // }
    // const fps: number = 60;
    // setInterval(rubenpong, 1000/fps);

    document.addEventListener('keydown', movePlat);
    document.addEventListener('keyup', stopMovePlat);


    //start of game define which plat - b / f?
    //update() function in backend
    //position plat, ball and player in backend?

    //powerups

  }
};
</script>

<style scoped>
.item {
	image-rendering: pixelated;
	margin-top: 2rem;
	display: flex;
}
.details {
	flex: 1;
	margin-left: 1rem;
}
i {
	display: flex;
	place-items: center;
	place-content: center;
	width: 32px;
	height: 32px;
	color: var(--color-text);
}
h3 {
	font-size: 1.2rem;
	font-weight: 500;
	margin-bottom: 0.4rem;
	color: var(--color-heading);
}
@media (min-width: 1024px) {
	.item {
		margin-top: 0;
		padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
	}
	i {
		top: calc(50% - 25px);
		left: -26px;
		position: absolute;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		border-radius: 8px;
		width: 50px;
		height: 50px;
	}
	.item:before {
		content: " ";
		border-left: 1px solid var(--color-border);
		position: absolute;
		left: 0;
		bottom: calc(50% + 25px);
		height: calc(50% - 25px);
	}
	.item:after {
		content: " ";
		border-left: 1px solid var(--color-border);
		position: absolute;
		left: 0;
		top: calc(50% + 25px);
		height: calc(50% - 25px);
	}
	.item:first-of-type:before {
		display: none;
	}
	.item:last-of-type:after {
		display: none;
	}
}
</style>
