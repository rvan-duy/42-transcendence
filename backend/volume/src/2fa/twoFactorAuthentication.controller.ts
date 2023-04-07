import { Controller, Get, UseGuards, Request, Response } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller()
export class TwoFactorAuthenticationController {
  constructor(
      private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('2fa/generate')
  async generateTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorSecret(req.user);
    return this.twoFactorAuthenticationService.pipeQrCode(res, otpauthUrl);
  }

}