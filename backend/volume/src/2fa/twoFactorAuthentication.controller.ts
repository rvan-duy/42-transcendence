import { Controller, Get, UseGuards, Request, Response, HttpStatus } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('2fa')
@ApiCookieAuth()
@ApiTags('2fa')
export class TwoFactorAuthenticationController {
  constructor(
      private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
      private readonly authService: AuthService,
  ) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a two-factor authentication secret' })
  @ApiResponse({ status: 200, description: 'Two-factor authentication secret generated' })
  async generateTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorSecret(req.user);
    return this.twoFactorAuthenticationService.pipeQrCode(res, otpauthUrl);
  }

  @Get('get-secret')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the two-factor authentication secret of the current user' })
  @ApiResponse({ status: 200, description: 'Two-factor authentication secret of current user', type: String })
  @ApiResponse({ status: 404, description: 'Two-factor authentication secret not found', type: String })
  async getTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const secret = await this.twoFactorAuthenticationService.getTwoFactorSecret(req.user.id);
    if (secret === null) {
      return res.status(HttpStatus.NOT_FOUND).send('Two-factor authentication secret not found');
    }
    return res.status(HttpStatus.OK).send(secret);
  }

  @Get('turn-on')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Turn on two-factor authentication for current user', 
    description: 'Verifies the two-factor code provided by the user against the generated secret. If the code is verified, turns on two-factor authentication for the user.'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Two-factor authentication turned on', type: String })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Two-factor authentication verification failed', type: String })
  async turnOnTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('Two-factor authentication verification failed');
    }
    this.twoFactorAuthenticationService.turnOnTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('Two-factor authentication turned on');
  }

  @Get('turn-off')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Turn off two-factor authentication for current user',
    description: 'Verifies the two-factor code provided by the user against the generated secret. If the code is verified, turns off two-factor authentication for the user.'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Two-factor authentication turned off', type: String })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Two-factor authentication verification failed', type: String })
  async turnOffTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('Two-factor authentication verification failed');
    }
    this.twoFactorAuthenticationService.turnOffTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('Two-factor authentication turned off');
  }

  // doesn't this need to be a post request? also it needs to redirect maybe?
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify a two-factor authentication code for current user (UNFINISHED)',
    description: 'Verifies the two-factor code provided by the user against the generated secret. If the code is verified, generates a new JWT token and sends it in a cookie in the response.'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Two-factor authentication verification succeeded', type: String })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Two-factor authentication verification failed', type: String })
  async verifyTwoFactorCode(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);
    if (isVerified === false) {
      return res.status(HttpStatus.FORBIDDEN).send('Two-factor authentication verification failed');
    }
  
    const loggedUser = await this.authService.login(req.user, true);
    res.clearCookie('jwt');
    res.cookie('jwt', loggedUser.access_token, {
      httpOnly: false, // we will access the cookie from the frontend, so we need to set this to false
      secure: false, // we are not using https, leave this off
    });
    return res.status(HttpStatus.OK).send('Two-factor authentication verification succeeded');
  }

}
