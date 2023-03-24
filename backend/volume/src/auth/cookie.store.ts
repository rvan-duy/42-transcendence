import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieStore {
  constructor(){}
  private userByCookie: Map<string, number> = new Map();

  addCookie(userId: number, cookie: string) {
    this.userByCookie.set(cookie, userId);
  }

  removeCookie(cookie: string) {
    this.userByCookie.delete(cookie);
  }

  getUserByCookie(Cookie: string): number {
    console.log('cookie', Cookie);
    
    // log the map
    this.userByCookie.forEach((value, key) => {
      console.log(`key: ${key}, value: ${value}`);
    });

    return this.userByCookie.get(Cookie);
  }
}