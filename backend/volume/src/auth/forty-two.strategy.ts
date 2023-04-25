import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-42';
import * as fs from 'fs';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: `http://${process.env.CODAM_PC}:${process.env.BACKEND_PORT}/auth/callback`,
      profileFields: {
        'id': function (obj: any) { return Number(obj.id); },
        'username': 'login',
        'pictureUrl': function(obj: any) { return obj.image.link; }
      }
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('INFO validating user', profile.username);
    
    const user = await this.authService.validateUser(profile.id, profile.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    fs.access(`/usr/src/app/public/user_${user.id}.png`, fs.constants.F_OK, (err) => {
      if (err) {
        this.authService.downloadFile(user.id, profile.pictureUrl, '/usr/src/app/public');
      }
    });
    return user;
  }
}