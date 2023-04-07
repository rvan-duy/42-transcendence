import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaUserService: PrismaUserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // When changing names of the user, the jwt token still has the old name
  // So do not rely on the username in the jwt token, use the id instead
  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
