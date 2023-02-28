
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
    // socket.on('canvas-update', pxlData => {
    //   if (init)
    //   {
    //     var tmpData = new Uint8ClampedArray(pxlData.data);
    //     tmpData = increaseArraySize(tmpData);
    //     ctx.putImageData(new ImageData(tmpData, 4, 4), pxlData.width * 4, pxlData.height * 4);
    //     console.log('received update on canvas');
    //   }
    //   else
    //   {
    //     queue.push(new ImageData(pxlData.data, pxlData.width, pxlData.height));
    //   }
    // });
    // socket.on('canvas-init', canvasData => {
    //   if (!ctx) {
    //     return;
    //   }
    //   var tmpData = new Uint8ClampedArray(canvasData.data);
    //   const iData: ImageData = new ImageData(tmpData, canvasData.width, canvasData.height);
    //   const tmpCanvas = document.createElement('canvas');
    //   tmpCanvas.width = 800;
    //   tmpCanvas.height = 800;
    //   var tmpctx: CanvasRenderingContext2D = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
    //   // var tmpctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    //   tmpctx.putImageData(iData, 0, 0);
    //   ctx.scale(4, 4);
    //   ctx.imageSmoothingEnabled = false;
    //   ctx.drawImage(tmpctx.canvas, 0, 0);
    //   // add everything from queue to canvasv (need to add)
    //   init = true;
    //   console.log('hope to have received the canvas-init');
    // });
		class GameData {
      ball: number[] = [500, 300];
      paddle1:  number[] = [0, 275];
      paddle2:  number[] = [980, 275];
      score:    number[] = [0, 0];
    }

socket.on('pos', (data: any) => {
        const datas: GameData = data;
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
          ctx.fillRect(datas.paddle1[0], datas.paddle1[1], other.width, other.height);
          //draw plateau you
          ctx.fillStyle = 'white';
          ctx.fillRect(datas.paddle2[0], datas.paddle2[1], plat.width, plat.height);
          //draw ball
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(datas.ball[0], datas.ball[1],ball.rad,0,Math.PI*2,false);
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
    function render()
    {
      socket.emit('pos');
    }

    const ball: {x: number, y: number, speed: number, Xvelocity: number, Yvelocity: number, rad: number} = {
      x: canvas.width/2,
      y: canvas.height/2,
      speed: 5,
      Xvelocity: 5,
      Yvelocity: 5,
      rad: 20,
    };

    const plat: {x: number, y: number, height: number, width: number, score:number} = {
      x: canvas.width - 20,
      y: canvas.height / 2 - 25,
      height: 100,
      width: 20,
      score: 0
    };

    const other: {x: number, y: number, height: number, width: number, score:number} = {
      x: 0,
      y : canvas.height / 2 - 25,
      height: 100,
      width: 20,
      score: 0
    };

    function movePlat(e: KeyboardEvent)
    {
      console.log(e.key);
      if (e.key === 'ArrowDown')
        socket.emit('ArrowDown');
      if (e.key === 'ArrowUp')
        socket.emit('ArrowUp');
      if (e.key === 'ArrowRight')
        socket.emit('ArrowRight');
      if (e.key === 'ArrowLeft')
        socket.emit('ArrowLeft');
    }

    function rubenpong()
    {
      render();
    }
    const fps: number = 60;
    setInterval(rubenpong, 1000/fps);

    document.addEventListener('keydown', movePlat);

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
