import { Controller, UseGuards, Request, Response, Get, HttpStatus } from '@nestjs/common';
import { FortyTwoGuard } from './forty-two-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { TwoFactorAuthenticationService } from '../2fa/twoFactorAuthentication.service';

@Controller('auth')
@ApiCookieAuth()
@ApiTags('auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: Object })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly TwoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) { }

  @Get('')
  @UseGuards(FortyTwoGuard)
  @ApiOperation({ summary: 'Redirects to 42 login' })
  async login() { }

  @Get('callback')
  @UseGuards(FortyTwoGuard)
  @ApiOperation({ summary: 'Callback for 42 login, redirects to frontend' })
  async callback(@Request() req: any, @Response() res: any) {
    const loggedUser = this.authService.login(req.user);

    res.clearCookie('jwt');
    res.cookie('jwt', loggedUser.access_token, {
      httpOnly: false, // we will access the cookie from the frontend, so we need to set this to false
      secure: false, // we are not using https, leave this off
    });
    return res.redirect(`http://${process.env.CODAM_PC}:${process.env.FRONTEND_PORT}`);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate JWT' })
  @ApiOkResponse({ description: 'JWT is valid', type: String })
  @ApiForbiddenResponse({ description: 'Two-factor authentication required', type: String })
  async check(@Request() req: any, @Response() res: any) {
    if (req.user.twoFactor === true && req.user.twoFactorVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('Two-factor authentication required');
    }

    return res.status(HttpStatus.OK).send('JWT is valid');
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiOperation({ summary: 'Logout, redirects to frontend' })
  async logout(@Request() req: any, @Response() res: any) {
    this.TwoFactorAuthenticationService.setVerified(req.user.id, false);
    res.clearCookie('jwt');
    return res.redirect(`http://${process.env.CODAM_PC}:${process.env.FRONTEND_PORT}`);
  }
}
