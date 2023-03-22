import { Controller, UseGuards, Request, Response, Get } from '@nestjs/common';
import { FortyTwoGuard } from './forty-two-auth.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(FortyTwoGuard)
  @Get('auth')
  async login() {}

  @UseGuards(FortyTwoGuard)
  @Get('auth/callback')
  async callback(@Request() req: any, @Response() res: any) {
    const loggedUser = this.authService.login(req.user);

    res.clearCookie('jwt');
    res.cookie('jwt', loggedUser.access_token, {
      httpOnly: false, // we will access the cookie from the frontend, so we need to set this to false
      secure: false, // we are not using https, leave this off
    });
    res.redirect(`http://${process.env.CODAM_PC}:8000`);
  }
}
