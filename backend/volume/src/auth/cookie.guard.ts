import { CanActivate, Injectable } from '@nestjs/common';
import { CookieStore } from './cookie.store';

@Injectable()
export class LocalGuard implements CanActivate {
  constructor(private cookieStore: CookieStore) {}

  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();

    // extract the cookie from the request
    const cookie = request.headers.cookie;

    if (this.cookieStore.getUserByCookie(cookie) === undefined) {
      return false;
    }

    return true;
  }
}
