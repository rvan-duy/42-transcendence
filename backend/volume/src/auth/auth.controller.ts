import { Controller, UseGuards, Request, Get } from '@nestjs/common';
import { FortyTwoGuard } from './forty-two-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(FortyTwoGuard)
  @Get('auth')
  async login(@Request() req: any) {}

  @UseGuards(FortyTwoGuard)
  @Get('auth/callback')
  async callback(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
