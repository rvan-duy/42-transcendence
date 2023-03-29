import { io } from 'socket.io-client';

class SocketioService {
  // socket: Socket;
  socket: any;

  constructor() {
    // this.socket = io(); // would this work as a standard constructor?
    // this.socket = io('http://localhost:3000'); //TODO: Replace with .env variable like 'process.env.VUE_APP_SOCKET_ENDPOINT'
  }

  setupSocketConnection(slash_namespace: string) {
    this.socket = io(`http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}${slash_namespace}`);
    this.socket.on('connect_error', (err: any) => {
      console.log(`connect_error due to ${err.message}`);
    });
    this.socket.on('connect', () => {
      console.log(`Set up socket between ${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}${slash_namespace} and frontend`);
    });
  }

}

export default new SocketioService();