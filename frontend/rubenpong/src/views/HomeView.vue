
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
		const socket = io('http://localhost:3000/game');
		socket.on('canvas-update', pxlData => {
			if (init)
			{
				var tmpData = new Uint8ClampedArray(pxlData.data);
				tmpData = increaseArraySize(tmpData);
				ctx.putImageData(new ImageData(tmpData, 4, 4), pxlData.width * 4, pxlData.height * 4);
				console.log('received update on canvas');
			}
			else
			{
				queue.push(new ImageData(pxlData.data, pxlData.width, pxlData.height));
			}
		});
		socket.on('canvas-init', canvasData => { 
			if (!ctx) {
				return;
			}
			var tmpData = new Uint8ClampedArray(canvasData.data);
			const iData: ImageData = new ImageData(tmpData, canvasData.width, canvasData.height);
			const tmpCanvas = document.createElement('canvas');
			tmpCanvas.width = 800;
			tmpCanvas.height = 800;
			var tmpctx: CanvasRenderingContext2D = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
			// var tmpctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
			tmpctx.putImageData(iData, 0, 0);
			ctx.scale(4, 4);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(tmpctx.canvas, 0, 0);
			// add everything from queue to canvasv (need to add)
			init = true;
			console.log('hope to have received the canvas-init');
		});
	
	function render()
	{
		//draw background
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		//draw plateau other player
		ctx.fillStyle = 'white';
		ctx.fillRect(other.x, other.y, other.width, other.height);
		//draw plateau you
		ctx.fillStyle = 'white';
		ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
		//draw ball
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.arc(ball.x,ball.y,ball.rad,0,Math.PI*2,false);
		ctx.closePath();
		ctx.fill();
		//draw text
		ctx.fillStyle = 'white';
		ctx.font = "50px arial";
		ctx.fillText('other', canvas.width / 4, canvas.height / 8);
		//draw text
		ctx.fillStyle = 'white';
		ctx.font = "50px arial";
		ctx.fillText(other.score.toString(), canvas.width / 4 + 40, canvas.height / 4);
		//draw text
		ctx.fillStyle = 'white';
		ctx.font = "50px arial";
		ctx.fillText('you', canvas.width / 4 * 3 - 100, canvas.height / 8);
		//draw text
		ctx.fillStyle = 'white';
		ctx.font = "50px arial";
		ctx.fillText(plat.score.toString(), canvas.width / 4 * 3 - 70, canvas.height / 4);
		//draw net
		for(let i = 0; i <= canvas.height; i+=15){
			ctx.fillStyle = 'white';
			ctx.fillRect(canvas.width / 2 - 1.5 , i, 3, 10);
		}
		// //draw text
		// ctx.fillStyle = 'white';
		// ctx.font = "100px arial";
		// ctx.fillText('you won', canvas.width / 2 - 200, canvas.height / 2);
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
	}

	const other: {x: number, y: number, height: number, width: number, score:number} = {
		x: 0,
		y : canvas.height / 2 - 25,
		height: 100,
		width: 20,
		score: 0
	}

	function scored()
	{
		ball.x = canvas.width/2;
		ball.y = canvas.height/2;
		ball.Xvelocity = -ball.Xvelocity;
		ball.speed = 5;
	}

	function  movePlat(e: KeyboardEvent)
	{
		if (e.key === 'ArrowDown')
			if (plat.y < canvas.height - plat.height)
				plat.y += 30;
		if (e.key === 'ArrowUp')
			if (plat.y > 0)
				plat.y -= 30;
	// var name = e.key;
	// var code = e.code;
	// // Alert the key name and key code on keydown
	// alert(`Key pressed ${name} \r\n Key code value: ${code}`);
	}

	function update()
	{
		 // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
		if(ball.x + ball.rad > canvas.width){
				other.score++;
				// comScore.play();
				scored();
		}else if(ball.x - ball.rad < 0){
				plat.score++;
				// userScore.play();
				scored();
		}
		// when COM or USER scores, we reset the ball
		//resetball


		ball.x += ball.Xvelocity;
		ball.y += ball.Yvelocity;
		if (ball.y + ball.rad > canvas.height || ball.y - ball.rad < 0){
				ball.Yvelocity = -ball.Yvelocity;
				// wall.play();
		}
		// var collision: boolean = false;
		// we check if the paddle hit the user or the com paddle
		var player : {x: number, y: number, height: number, width: number, score:number} = (ball.x + ball.rad < canvas.width/2) ? other : plat;
		//if there is a collision
		if (player.x < ball.x + ball.rad && player.y < ball.y + ball.rad && player.x + player.width > ball.x - ball.rad && player.y + player.height > ball.y - ball.rad)
		{
			// where the ball hits the plateau & normalize
			var collisionPoint:number = ((ball.y - (player.y + player.height/2))) / (player.height/2);
			// from -45degrees to +45degrees
			// Math.PI/4 = 45degrees
			var angleRad: number = (Math.PI/4) * collisionPoint;
			// change X & Y velocity dir
			var dir:number= (ball.x + ball.rad < canvas.width/2) ? 1 : -1;
			ball.Xvelocity = dir * ball.speed * Math.cos(angleRad);
			ball.Yvelocity = ball.speed * Math.sin(angleRad);
			
			// speed up the ball everytime a paddle hits it.
			ball.speed += 0.1;
		}
	}

	function rubenpong()
	{
		update();
		render();
	};
	const fps: number = 60;
	setInterval(rubenpong, 1000/fps);
	// canvas.addEventListener("keyup", movePlatUp);
	// canvas.addEventListener("keydown", movePlatDown);
	// input.addEventListener('keypress', logKey);
	// function logKey(evt : KeyboardEvent) {
	//   console.log(evt.key);
	// }
	// const input: HTMLInputElement = document.querySelector('input');

	// console.log(input);
	// input.addEventListener('keypress', (e: KeyboardEvent) =>{
	//          //You have yout key code here
	//           console.log(e.key);
	//       });
	document.addEventListener('keydown', movePlat);

//   var name = event.key;
//   var code = event.code;
//   // Alert the key name and key code on keydown
//   alert(`Key pressed ${name} \r\n Key code value: ${code}`);
// }, false);

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
