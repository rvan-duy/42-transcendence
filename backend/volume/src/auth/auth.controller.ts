import { Controller, UseGuards, Request, Response, Get, Post, HttpStatus, HttpCode } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactorAuth(@Request() req: any, @Response() res: any) {
    const isCodeValid: Promise<boolean> = this.authService.verifyTwoFactorCode(req.user, req.body.code);
    if (isCodeValid) {
      await this.authService.turnOnTwoFactorAuth(req.user.id);
      console.log('👻 2FA enabled for user', req.user.name);
      res.status(HttpStatus.OK).send();
    }
    else {
      console.log('💥 2FA enabeling failed for user', req.user.name);
      res.status(HttpStatus.BAD_REQUEST).send('Invalid authentication code');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disableTwoFactorAuth(@Request() req: any, @Response() res: any) {
    const isCodeValid: Promise<boolean> = this.authService.verifyTwoFactorCode(req.user, req.body.code);
    if (isCodeValid) {
      await this.authService.turnOffTwoFactorAuth(req.user.id);
      console.log('🎃 2FA disabled for user', req.user.name);
      res.status(HttpStatus.OK).send();
    }
    else {
      console.log('💥 2FA validation failed for user', req.user.name);
      res.status(HttpStatus.BAD_REQUEST).send('Invalid authentication code');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/validate')
  @HttpCode(HttpStatus.OK)
  async validateTwoFactorAuth(@Request() req: any, @Response() res: any) {
    const isCodeValid: Promise<boolean> = this.authService.verifyTwoFactorCode(req.user, req.body.code);
    if (isCodeValid) {
      console.log('🌱 2FA validation succeeded for user', req.user.name);
      return this.authService.loginWithTwoFactor(req.user);
    }
    else {
      console.log('💥 2FA validation failed for user', req.user.name);
      res.status(HttpStatus.BAD_REQUEST).send('Invalid authentication code');
    }
  }
}
