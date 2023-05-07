<script setup lang="ts">
</script>

<template>
  <div class="item">
    <div style="text-align: center">
      <div v-if="!inQueue && !inGame">
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
              @click="queueForGame('Normal')"
            >
              NORMAL
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="queueForGame('FreeMove')"
            >
              FREEMOVE
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="queueForGame('PowerUp')"
            >
              POWERUP
            </button>
          </div>
          <div class="p-2">
            <button
              v-if="selectGameMode"
              class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              @click="queueForGame('Fiesta')"
            >
              FIESTA
            </button>
          </div>
        </div>
      </div>
      <div v-if="inQueue">
        Queueing for a game!
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
import SocketioService from '../services/socketio.service.js';
import { getBackend } from '@/utils/backend-requests';
import { GameMode } from '../utils/game-definitions';
import type { CurrentGameState } from '../utils/game-definitions';
export default {

  data()
  {
    return {
      selectGameMode: false,
      gameMode : GameMode.UNMATCHED,
      inQueue: false,
      inGame: false,
      powerUp: '',
      powerUpActive: false,
      powerUpOnField: false,
      frame: 0,
      userId : -1,
      gameId: -1,
      arrowUp: false,
      arrowDown: false,
      arrowLeft: false,
      arrowRight: false,
      connection: SocketioService,
      namePlayer1: '',
      namePlayer2: '',
    };
  },
  async created () {
    let userId: number = -1;
    await getBackend('user/me')
      .then(function(res){
        console.log(res);
        return res.json();
      })
      .then((data) => {
        userId = data.id;
        console.log(data);
      })
      .catch(e => {
        userId = -1;
        console.log(e);
        // ToDo: show error to reload / relog
      });

    this.userId = userId;
    console.log(`received userId: ${this.userId}`);

  },
  mounted() {
    const canvas: HTMLCanvasElement = document.getElementById('pixels') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.connection.setupSocketConnection('/game');

    this.connection.socket.on('FailedToAuthenticate', () => {
      console.log('Authentication failed');
      this.goTo('login');
    });

    // ask the server to check if the user is already in a game or not
    this.connection.socket.emit('CheckGameStatus', this.userId);
    
    // retrieve if the user is already in a game or not
    this.connection.socket.on('GameStatus', (data: any) => {
      if (data.alreadyInGame === true) {
        this.namePlayer1 = data.namePlayer1;
        this.namePlayer2 = data.namePlayer2;
        this.inGame = true;
        this.inQueue = false;
        this.gameId = data.gameId;
        this.gameMode = data.gameMode;
        this.powerUpActive = data.powerUpActive;
        this.powerUp = data.powerUp;
        this.listenToGame(ctx, canvas);
      }
      else if (data.alreadyInQueue) {
        this.inQueue = true;
        this.inGame = false;
        this.gameMode = data.gameMode;
      }
    });

    // once a game is created with the user inside start listening to the game
    this.connection.socket.on('GameCreated', (data: any) => {
      if (data.player1 === this.userId || data.player2 === this.userId) {
        this.namePlayer1 = data.namePlayer1;
        this.namePlayer2 = data.namePlayer2;
        this.gameId = data.gameId;
        this.inGame = true;
        this.inQueue = false;
        this.listenToGame(ctx, canvas);
      }
    });

    // set the functions for the movement handling
    document.addEventListener('keydown', this.keyDownEvent);
    document.addEventListener('keyup', this.keyUpEvent);
  },
  unmounted() {
    document.removeEventListener('keydown', this.keyDownEvent);
    document.removeEventListener('keyup', this.keyUpEvent);
    this.connection.socket.disconnect();
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },

    listenToGame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      // get the position and current gamestate back from the server
      this.connection.socket.on('GameState', (data: any) => {
        const state: CurrentGameState = data;
        this.drawGame(ctx, canvas, state);
      });
      
      // Listen to the power up being enabled
      this.connection.socket.on('EnablePowerUp', (data: any) => {
        const powerUpType: string = data;
        this.frame = 0;
        this.powerUpActive = true;
        this.powerUp = `${powerUpType} enabled!`;
      });
      
      // Listen to the power up being disabled after being enabled
      this.connection.socket.on('DisablePowerUp', (resetString: string) => {
        this.powerUp = resetString;
        this.powerUpActive = false;
      });

      // Listen to the game ending and the winner of that match
      this.connection.socket.on('Winner', (winningUser: string) => {
        this.inGame = false;
        this.drawEndScreen(ctx, canvas, winningUser);
        this.connection.socket.off('GameState');
      });
    },

    keyDownEvent(e: KeyboardEvent) {
      if (this.userId === -1 || this.inGame === false) {
        return;
      }

      const payload = {userId: this.userId, gameId: this.gameId, enabled: true, key: e.key};
      if (!this.arrowDown && e.key === 'ArrowDown')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowDown = true;
      }
      else if (!this.arrowUp && e.key === 'ArrowUp')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowUp = true;
      }
      else if (!this.arrowRight && e.key === 'ArrowRight')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowRight = true;
      }
      else if (!this.arrowLeft && e.key === 'ArrowLeft')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowLeft = true;
      }
    },

    keyUpEvent(e: KeyboardEvent) {
      if (this.userId === -1 || this.inGame === false)
        return;

      const payload = {userId: this.userId, gameId: this.gameId, enabled: false, key: e.key};
      if (e.key === 'ArrowDown')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowDown = false;
      }
      else if (e.key === 'ArrowUp')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowUp = false;
      }
      else if (e.key === 'ArrowRight')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowRight = false;
      }
      else if (e.key === 'ArrowLeft')
      {
        this.connection.socket.emit('UpdateInput', payload);
        this.arrowLeft = false;
      }
    },

    queueForGame(gameMode: string) {
      var canvas: HTMLCanvasElement = document.getElementById('pixels') as HTMLCanvasElement;
      var ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
      this.gameMode = gameMode as GameMode;
      this.inQueue = true;

      // clears the previous game if there is one still displayed
      ctx.clearRect(0, 0, 1000, 6000);

      // Send the server a request to be queued in the given game-mode's queue
      const packet = {gameMode: this.gameMode, userId: this.userId};
      this.connection.socket.emit('QueueForGame', packet);
    },

    drawGame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CurrentGameState) {
      // draw background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // draw net
      for(let i = 0; i <= canvas.height; i+=15){
        ctx.fillStyle = 'white';
        ctx.fillRect(canvas.width / 2 - 1.5 , i, 3, 10);
      }

      // draw paddle player 1
      ctx.fillStyle = 'white';
      ctx.fillRect(state.leftPaddleCoords[0], state.leftPaddleCoords[1], state.leftPaddleWidth, state.leftPaddleHeight);

      // draw paddle player 2
      ctx.fillStyle = 'white';
      ctx.fillRect(state.rightPaddleCoords[0], state.rightPaddleCoords[1], state.rightPaddleWidth, state.rightPaddleHeight);

      // draw ball
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(state.ballCoords[0], state.ballCoords[1], state.ballRadius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();

      // draw text player 1
      ctx.fillStyle = 'white';
      ctx.font = '50px arial';
      ctx.fillText(this.namePlayer1, canvas.width / 4 - 100, canvas.height / 8);

      // draw text score player 1
      ctx.fillStyle = 'white';
      ctx.font = '50px arial';
      ctx.fillText(state.score[0].toString(), canvas.width / 4 + 40, canvas.height / 4);

      // draw text player 2
      ctx.fillStyle = 'white';
      ctx.font = '50px arial';
      ctx.fillText(this.namePlayer2, canvas.width / 4 * 3 - 100, canvas.height / 8);

      // draw text score player 2
      ctx.fillStyle = 'white';
      ctx.font = '50px arial';
      ctx.fillText(state.score[1].toString(), canvas.width / 4 * 3 - 70, canvas.height / 4);

      // draw PowerUp is it is on the field
      if (state.powerUpOnField) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(state.powerUpCoords[0], state.powerUpCoords[1], state.powerUpRadius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }

      // draw text power-up being enabled
      if (this.powerUpActive)
      {
        ctx.fillStyle = 'aqua';
        ctx.font = '30px arial';
        ctx.fillText(this.powerUp, canvas.width / 2 - 100, canvas.height - 100);
      }
    },

    drawEndScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, winningUser: string) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '50px arial';
      ctx.fillText(`${winningUser} won!`, canvas.width / 2 - 100, canvas.height / 2);
    },

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
