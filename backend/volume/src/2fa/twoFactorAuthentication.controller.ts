import { Controller, Get, UseGuards, Request, Response, HttpStatus } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller()
export class TwoFactorAuthenticationController {
  constructor(
      private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
      private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('2fa/generate')
  async generateTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorSecret(req.user);
    return this.twoFactorAuthenticationService.pipeQrCode(res, otpauthUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('2FA verification failed');
    }
    this.twoFactorAuthenticationService.turnOnTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('2FA turned on');
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/turn-off')
  async turnOffTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('2FA verification failed');
    }
    this.twoFactorAuthenticationService.turnOffTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('2FA turned off');
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/verify')
  async verifyTwoFactorCode(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('2FA verification failed');
    }
  
    const loggedUser = await this.authService.login(req.user, true);
    res.clearCookie('jwt');
    res.cookie('jwt', loggedUser.access_token, {
      httpOnly: false, // we will access the cookie from the frontend, so we need to set this to false
      secure: false, // we are not using https, leave this off
    });
    return res.status(HttpStatus.OK).send('2FA verification succeeded');
  }

}
