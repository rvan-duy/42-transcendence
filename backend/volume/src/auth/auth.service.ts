import { Injectable } from '@nestjs/common';
import { PrismaUserService } from '../user/prisma/prismaUser.service';

@Injectable()
export class AuthService {
  constructor(private userService: PrismaUserService) {}

  get_or_create(intraId: number, name: string) {
    const currentUser = this.userService.user({intraId: intraId});
    if (currentUser)
      return currentUser;
    return this.userService.createUser({
      intraId: intraId,
      name: name,
    });
  }
}
