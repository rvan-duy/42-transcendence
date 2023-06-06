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

  // The issue from above is presumably fixed, but I'm not sure

  async validate(payload: any) {
    // console.log('payload', payload);

    const user = await this.prismaUserService.user({ id: payload.sub });
    if (!user) {
      return null;
    }

    // if (user.twoFactor === true && payload.isSecondFactorAuthenticated === false) {
    // return null;
    // }

    return user;
  }
}
