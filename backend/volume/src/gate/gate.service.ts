import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

function getKeysByValue(map: Map<any, any>, searchValue: any): any[] {
  let keys: any[] = [];
  for (let [key, value] of map.entries()) {
    if (value === searchValue) {
      keys.push(key);
    }
  }
  return keys;
}

@Injectable()
export class GateService {
  constructor(){}
  private userBySocket: Map<Socket, number> = new Map();

  addSocket(userId: number, sock: Socket) {
    this.userBySocket.set(sock, userId);
  }

  removeSocket(sock: Socket) {
    this.userBySocket.delete(sock)
  }

  async getSocketsByUser(userId: number): Promise<Socket[]> {
    const allUserChatSockets = getKeysByValue(this.userBySocket, userId);
    return allUserChatSockets;
  }

  async getUserBySocket(socket: Socket): Promise<number> {
    return this.userBySocket.get(socket);
  }
}