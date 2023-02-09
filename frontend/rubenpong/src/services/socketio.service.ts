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

}

export default new SocketioService();