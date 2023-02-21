/*
 * This file contains the logic for the authentication flow
  * The authentication flow is as follows:
  * 1. The user clicks the login button               (frontend)
  * 2. The user is redirected to the 42 API           (frontend -> 42 API)
  * 3. The user logs in with their 42 credentials     (42 API)
  * 4. The user is redirected back to the application (42 API -> backend)
  * 5. The user is authenticated                      (backend)
  * 6. The user is redirected to the home page        (backend -> frontend)
*/

import { Controller, Get, Req, Query, Res, Module, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import axios from 'axios';

// TODO: move these enums to a separate file

enum StatusCodes {
  Ok = 200,
  BadRequest = 400,
  InternalServerError = 500,
}

enum ResponseMessages {
  SuccessLogin = 'Successfully logged in',
  InvalidRequest = 'The provided state value is invalid.',
  InternalServerError = 'An unexpected error occurred',
}

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Get('callback')
  async callback(@Req() req, @Res() res, @Query('code') code: string, @Query('state') state: string) {

    if (state !== process.env.STATE_VALUE) {
      return res.status(StatusCodes.BadRequest).send(ResponseMessages.InvalidRequest);
    }

    try {
      const token = await this.AuthService.requestAccessToken(code);
      const user = await this.AuthService.requestUserData(token); // the user object contains user data

      // if this response is successful we can verify the user
      // check if the user exists in the database
      // - if the user exists, log the user in
      // - if the user does not exist, create the user and log the user in
      // cookie the user

      return res.status(StatusCodes.Ok).send(ResponseMessages.SuccessLogin);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.message);
        return res.status(error.response.status).send(error.message);
      } else {
        console.log('unexpected error: ', error);
        return res.status(StatusCodes.InternalServerError).send(ResponseMessages.InternalServerError);
      }
    }
  }
}
