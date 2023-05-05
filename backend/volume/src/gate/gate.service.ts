import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

function getKeysByValue(map: Map<any, any>, searchValue: any): any[] {
  const keys: any[] = [];
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      keys.push(key);
    }
  }
  return keys;
}

function logSocketUserMap(value: number, key: Socket, map: Map<Socket, number>) {
  console.log(`userId: ${value}, socket: ${key}`);
}

@Injectable()
export class GateService {
  constructor(){
    console.log('I am a gateService');
  }
  private userBySocket: Map<Socket, number> = new Map();

  addSocket(userId: number, sock: Socket) {
    this.userBySocket.set(sock, userId);
  }

  removeSocket(sock: Socket) {
    this.userBySocket.delete(sock);
  }

  async getSocketsByUser(userId: number): Promise<Socket[]> {
    const allUserChatSockets = getKeysByValue(this.userBySocket, userId);
    return allUserChatSockets;
  }

  async getUserBySocket(socket: Socket): Promise<number> {
    return this.userBySocket.get(socket);
  }

  async printAllConnections() {
    this.userBySocket.forEach(logSocketUserMap);
  }
}
