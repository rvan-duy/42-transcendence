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

/*
 * TODO's
 * - Implement frontend Logic
 * - Store access token in cookie and possibly in database
 * - Maybe better error handling
 * - Maybe better security
 * - Add tests
*/

import { Controller, Get, Req, Query, Res, } from '@nestjs/common';
// import { Request, Response } from 'express'; // will be used later
import { AuthService } from './auth.service';
import { StatusCodes, ResponseMessages } from '../constants';
import axios from 'axios';

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
      const { id, login } = await this.AuthService.requestUserData(token);
      const my_user = await this.AuthService.getOrCreateUser(id, login);
      console.log('user logged in: ', my_user);
      
      // cookie the user

      res.status(StatusCodes.Ok);
      
      res.cookie('cookie', token, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      
      res.redirect('http://localhost:8000');
      return;

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
