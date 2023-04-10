import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import * as fs from 'fs';
import * as https from 'https';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaUserService: PrismaUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(intraId: number, name: string): Promise<any> {
    return await this.prismaUserService.findOrCreateUser({intraId, name});
  }

  login(user: any, isSecondFactorAuthenticated = false): any {
    const payload = {
      username: user.name,
      sub: user.id,
      isSecondFactorAuthenticated,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async downloadFile(userId: number, url: string, folderPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const fileName = 'user_' + userId + '.jpg';
      const filePath = `${folderPath}/${fileName}`;
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`📷 Profile picture downloaded to ${filePath}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {
          console.log('💥 Error downloading profile picture', err);
          reject(err);
        });
      });
    });
  }
}