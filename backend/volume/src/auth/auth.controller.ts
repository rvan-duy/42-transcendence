import {
  Controller,
  Get,
  Req,
  Query,
} from '@nestjs/common';
import axios from 'axios';

type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
};

  @Controller('auth')
export class AuthController {
  constructor(
  ) {}
  
  @Get('callback')
  async callback(@Req() req, @Query('code') code: string, @Query('state') state: string) {
    const client_secret = process.env.APPLICATION_SECRET;

    if (state !== 'RubenRubenEnDeRest') {
      return {
        error: 'Invalid state',
        error_description: 'The state parameter does not match the expected value',
      };
    }
    try {
      const { data, status } = await axios.post<AuthResponse>('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: 'u-s4t2ud-77defdf5da75714147831f8ce2531c3aa1554a9e79226dc62041558ded39460b',
        client_secret: client_secret,
        code: code,
        state: state,
        redirect_uri: 'http://localhost:3000/auth/callback',
      })

      console.log('status', status);
      console.log('data', data);

      // do a get request to get the user data
      const res = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      // if this response is successful we can verify the user
      // check if the user exists in the database
      // - if the user exists, log the user in
      // - if the user does not exist, create the user and log the user in
      // cookie the user

      console.log('login', res.data['login']);
      console.log('email', res.data['email']);
      console.log('id', res.data['id']);
      
      return 'OK';

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred'
      }
    }
  }
}
