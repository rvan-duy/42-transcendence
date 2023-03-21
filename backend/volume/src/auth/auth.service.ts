import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaUserService } from '../user/prisma/prismaUser.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaUserService: PrismaUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(intraId: number, name: string): Promise<any>{
    return await this.prismaUserService.findOrCreateUser({intraId, name});
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.intraId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
