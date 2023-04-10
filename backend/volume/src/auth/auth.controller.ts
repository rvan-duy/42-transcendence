import { Controller, UseGuards, Request, Response, Get, HttpStatus } from '@nestjs/common';
import { FortyTwoGuard } from './forty-two-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    res.redirect(`http://${process.env.CODAM_PC}:${process.env.FRONTEND_PORT}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/validate')
  async check(@Request() req: any, @Response() res: any) {
    res.status(HttpStatus.OK).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/logout')
  async logout(@Request() req: any, @Response() res: any) {
    res.clearCookie('jwt');
    res.redirect(`http://${process.env.CODAM_PC}:${process.env.FRONTEND_PORT}`);
  }
}
