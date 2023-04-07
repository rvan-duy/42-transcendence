import { Injectable } from '@nestjs/common';

function getKeyByValue(map: Map<any, any>, searchValue: any): any {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return undefined;
}

@Injectable()
export class CookieService {
  constructor(){}
  private userByCookie: Map<string, number> = new Map();

  addCookie(userId: number, sock: string) {
    this.userByCookie.set(sock, userId);
  }

  removeCookie(sock: string) {
    this.userByCookie.delete(sock);
  }

  async getCookieByUser(userId: number): Promise<string> {
    const allUserChatCookies = getKeyByValue(this.userByCookie, userId);
    return allUserChatCookies;
  }

  async getUserByCookie(Cookie: string): Promise<number> {
    return this.userByCookie.get(Cookie);
  }
}