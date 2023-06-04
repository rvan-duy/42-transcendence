import { Controller, Get, UseGuards, Request, Response, HttpStatus, Post } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { ApiBadRequestResponse, ApiBody, ApiCookieAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('2fa')
@ApiCookieAuth()
@ApiTags('2fa')
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: Object })
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly authService: AuthService,
  ) { }

  @Get('generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a two-factor authentication secret' })
  @ApiOkResponse({ description: 'Two-factor authentication secret generated', type: String })
  async generateTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorSecret(req.user);
    return this.twoFactorAuthenticationService.pipeQrCode(res, otpauthUrl);
  }

  @Get('secret')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the two-factor authentication secret of the current user' })
  @ApiOkResponse({ description: 'Two-factor authentication secret of current user', type: String })
  @ApiNotFoundResponse({ description: 'Two-factor authentication secret not found', type: String })
  async getTwoFactorSecret(@Request() req: any, @Response() res: any) {
    const secret = await this.twoFactorAuthenticationService.getTwoFactorSecret(req.user.id);
    if (secret === null) {
      return res.status(HttpStatus.NOT_FOUND).send('Two-factor authentication secret not found');
    }
    return res.status(HttpStatus.OK).send(secret);
  }

  @Post('turn-on')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Turn on two-factor authentication for current user',
    description: 'Verifies the two-factor code provided by the user against the generated secret. If the code is verified, turns on two-factor authentication for the user.'
  })
  @ApiBody({ description: 'The two-factor code to verify (code)', type: Object })
  @ApiOkResponse({ description: 'Two-factor authentication turned on', type: String })
  @ApiBadRequestResponse({ description: 'Two-factor authentication verification failed', type: String })
  async turnOnTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);

    if (isVerified === false) {
      return res.status(HttpStatus.BAD_REQUEST).send('Two-factor authentication verification failed');
    }

    this.twoFactorAuthenticationService.turnOnTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('Two-factor authentication turned on');
  }

  @Post('turn-off')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Turn off two-factor authentication for current user',
    description: 'Verifies the two-factor code provided by the user against the generated secret. If the code is verified, turns off two-factor authentication for the user.'
  })
  @ApiBody({ description: 'The two-factor code to verify (code)', type: Object })
  @ApiOkResponse({ description: 'Two-factor authentication turned off', type: String })
  @ApiBadRequestResponse({ description: 'Two-factor authentication verification failed', type: String })
  async turnOffTwoFactorAuthentication(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);

    if (isVerified === false) {
      return res.status(HttpStatus.BAD_REQUEST).send('Two-factor authentication verification failed');
    }

    this.twoFactorAuthenticationService.turnOffTwoFactorForUser(req.user.id);
    return res.status(HttpStatus.OK).send('Two-factor authentication turned off');
  }

  @Post('submit-code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit a two-factor authentication code for current user',
    description: 'Verifies the two-factor code provided by the user against the generated secret.'
  })
  @ApiBody({ description: 'The two-factor code to verify (code)', type: Object })
  @ApiOkResponse({ description: 'Two-factor authentication verification succeeded', type: String })
  @ApiBadRequestResponse({ description: 'Two-factor authentication verification failed', type: String })
  async submitTwoFactorCode(@Request() req: any, @Response() res: any) {
    const isVerified = await this.twoFactorAuthenticationService.verifyTwoFactorCode(req.user.id, req.body.code);

    if (isVerified === false) {
      return res.status(HttpStatus.BAD_REQUEST).send('Two-factor authentication verification failed');
    }

    await this.twoFactorAuthenticationService.setVerified(req.user.id);
    return res.status(HttpStatus.OK).send('Two-factor authentication verification succeeded');
  }

  /*
   * Legacy code, not used anymore
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify a two-factor authentication code for current user (LEGACY)',
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
