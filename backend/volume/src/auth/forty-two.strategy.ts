import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-42';

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
        'picture': function(obj: any) { return obj.image.link; }
      }
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('INFO validating user', profile.username);
        
    const user = await this.authService.validateUser(profile.id, profile.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    this.authService.downloadFile(profile.picture, '/usr/src/app/public')
      .then(() => {
        console.log('INFO profile picture downloaded');
      })
      .catch((err) => {
        console.log('ERROR downloading profile picture', err);
      });

    return user;
  }
}