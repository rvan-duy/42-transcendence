import { Injectable } from "@nestjs/common";
import { Socket } from "dgram";

interface socketContainer {
  gameSocket: Socket,
  chatSockets: Socket[],
}

@Injectable()
export class GateService {
  constructor(){}
  private usersOnline: Map<number, socketContainer>;

  addChatSocket(userId: number, sock: Socket) {
    let tmpSock: socketContainer;
    if (this.usersOnline.has(userId)) {
      tmpSock = this.usersOnline[userId]
      tmpSock.chatSockets.push(sock);
      this.usersOnline.set
    } else {
      tmpSock = {
        gameSocket: undefined,
        chatSockets: [sock],
      }
    }
    this.usersOnline.set(userId, tmpSock);
  }

  setGameSocket(userId: number, sock: Socket) {
    let tmpSock: socketContainer;
    tmpSock = this.usersOnline.get(userId);
    tmpSock.gameSocket = sock;
    this.usersOnline.set(userId, tmpSock);
  }

  deleteChatSocket(userId: number, sock: Socket) {
    let container = this.usersOnline.get(userId);
    const index = container.chatSockets.indexOf(sock);
    container.chatSockets.splice(index, 1);
    this.usersOnline.set(userId, container);
  }

  async getUserGameSocket(userId: number): Promise<Socket>  {
    const container = this.usersOnline.get(userId);
    return container.gameSocket;
  }

  async getUserChatSockets(userId: number): Promise<Socket[]> {
    const container = this.usersOnline.get(userId);
    return container.chatSockets;
  }
}