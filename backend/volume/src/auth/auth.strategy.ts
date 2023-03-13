import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';

/*
 * This class is used to override the default passport-42 strategys
 */
@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor() {
    super({
      clientID: process.env.APPLICATION_ID,
      clientSecret: process.env.APPLICATION_SECRET,
      state: process.env.STATE_VALUE,
      callbackURL: process.env.REDIRECT_URI,
    });
  }

  /*
   * This function overrides the default passport-42 strategy
   */
  async authenticate(req: any, options: any) {
    req.session.state = Math.random().toString(36).substring(7);
    // options.state = req.session.state;
    super.authenticate(req, options);
  }

  // async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
  //   console.log('validate', accessToken, refreshToken, profile, done)
  //   done(null, profile);
  // }

  // this overrides the default passport-42 strategy
  // async authenticate(accessToken, refreshToken, profile, cb) {
  //   console.log('validate', accessToken, refreshToken, profile, cb)
  //   const res = await this.AuthService.requestUserData(accessToken);
  //   return res.data.login; // TODO: return user object
  // }
}
