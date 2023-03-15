import { Injectable } from '@nestjs/common';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import axios from 'axios';

type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

@Injectable()
export class AuthService {
  constructor(private userService: PrismaUserService) {}

  /*
   * Request an access token from the 42 API
   */
  async requestAccessToken(code: string) {
    const { data, status } = await axios.post<AuthResponse>('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.APPLICATION_ID,
      client_secret: process.env.APPLICATION_SECRET,
      code: code,
      state: process.env.STATE_VALUE,
      redirect_uri: process.env.REDIRECT_URI,
    });

    if (status !== 200) {
      throw new Error('Error requesting access token');
    }

    console.log('Successfully requested access token ', data.access_token);
    return data.access_token;
  }

  /*
   * Request user data from the 42 API
   */
  async requestUserData(token: string) {
    const { data, status } = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (status !== 200) {
      throw new Error('Error requesting user data');
    }

    console.log(`Successfully requested user data of ${data.login}`);
    return data;
  }

  generateCookie(): string {
    const len = 500;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

}
