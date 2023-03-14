import { Injectable } from "@nestjs/common";
import { Socket } from "dgram";


@Injectable()
export class GateService {
  constructor(){}
  private usersOnline: Map<number, Socket>;

  userComesOnline(userId: number, sock: Socket) {
    this.usersOnline.set(userId, sock);
  }

  userGoesOffline(userId: number) {
    this.usersOnline.delete(userId);
  }

  async getUserSocket(userId: number): Promise<Socket>  {
    return this.usersOnline[userId];
  }
}