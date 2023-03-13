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

import { Controller, UseGuards, Get, Post, Req, Query, Res, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { StatusCodes, ResponseMessages } from '../constants';
import axios from 'axios';

import { Session } from '@nestjs/common';
import { Session as ExpressSession } from 'express-session';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly AuthService: AuthService,
    ) {}

  @Get('test')
  @UseGuards(AuthGuard('ft'))
  async test(@Req() req, @Res() res) {
    console.log('hello', req.body);
    return res.status(StatusCodes.Ok).send('hello');
  }

  @Get('test2')
  someMethod(@Session() session: ExpressSession) {
    return session;
  }

  /*
   * Sends a GET to 42 API
   * Waits for response
   * Parses response
   * Checks if user is in database and does one of two things
   * 1. Creates a new user and sends back success frontend (200)
            Maybe different error code?
   * 2. User already exists so just sends back success to frontend (200)
   * Catch exceptions
   */
  @Post('authorize')
  @UseGuards(AuthGuard('ft'))
  async authorize(@Req() req, @Res() res) {
    
    // Check cookie, do we recognize the user?
    // If yes, redirect to home page
    // If no, continue with authorization


    
    console.log('hello', req.body);
    return res.status(StatusCodes.Ok).send('hello');
  }

  @Get('callback')
  async callback(@Req() req, @Res() res, @Query('code') code: string, @Query('state') state: string) {

    // console.log('state: ', state);
    // console.log('req.session.state: ', req.session.state);

    // if (state !== session.secret) {
    //   return res.status(StatusCodes.BadRequest).send(ResponseMessages.InvalidRequest);
    // }

    try {
      const token = await this.AuthService.requestAccessToken(code);
      const { id, login } = await this.AuthService.requestUserData(token);
      const my_user = await this.AuthService.getOrCreateUser(id, login);
      console.log('user logged in: ', my_user);
      
      // cookie the user

      res.status(StatusCodes.Ok);
      
      res.cookie('cookie', token, {
        httpOnly: false, // temporary for debugging, should be true in production
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
