<<<<<<< HEAD
// import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

class SocketioService {
  // socket: Socket;
  socket: any;

  constructor() {
    // this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
  }

  setupSocketConnection() {
    this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
    console.log('Set up socket between localhost:3000 and frontend');
  }
=======
import { io, Socket } from 'socket.io-client';

class SocketioService {
	// socket: Socket;
	socket: any;

	constructor() {
		// this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
	}

	setupSocketConnection() {
		this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
		console.log("Set up socket between localhost:3000 and frontend");
	}
>>>>>>> 28269a14bb23c5166b139856686d06dfaf60e4b8

}

export default new SocketioService();