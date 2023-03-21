import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Strategy } from "passport-42";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.APPLICATION_ID,
      clientSecret: process.env.APPLICATION_SECRET,
      callbackURL: `http://${process.env.CODAM_PC}/auth/callback`,
      profileFields: {
        'id': function (obj: any) { return Number(obj.id); },
        'username': 'login',
      }
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, cb: Function) {
    console.log('validating user', profile.username);
    const user = await this.authService.validateUser(profile.id, profile.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}