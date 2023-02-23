// import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

class SocketioService {
  // socket: Socket;
  socket: any;

  constructor() {
    // this.socket = io(); // would this work as a standard constructor?
    // this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
  }

  setupSocketConnection() {
    this.socket = io('http://localhost:3000/chat'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
	this.socket.on("connect_error", (err: any) => {
		console.log(`connect_error due to ${err.message}`);
    });
	this.socket.on('connect', () => {
		console.log('Set up socket between localhost:3000/chat and frontend');
    });
  }

}

export default new SocketioService();