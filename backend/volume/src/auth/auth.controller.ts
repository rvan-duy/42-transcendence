import { Controller, UseGuards, Request, Response, Get } from '@nestjs/common';
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

    res.cookie('jwt', loggedUser.access_token, {
      httpOnly: false,
      secure: false,
    });
    res.redirect(`http://${process.env.CODAM_PC}:8000`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
