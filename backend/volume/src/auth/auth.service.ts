import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
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

  login(user: any): any {
    const payload = { 
      username: user.name, 
      sub: user.id,
      isTwoFactorAuthenticationEnabled: user.twoFactor,
      isTwoFactorAuthenticated: false,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  loginWithTwoFactor(user: any): any {
    const payload = {
      username: user.name,
      sub: user.id,
      isTwoFactorAuthenticationEnabled: user.twoFactor,
      isTwoFactorAuthenticated: true,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async turnOnTwoFactorAuth(id: number): Promise<any> {
    return await this.prismaUserService.updateUser({
      where: {
        id: id
      },
      data: {
        twoFactor: true
      }
    });
  }

  async turnOffTwoFactorAuth(id: number): Promise<any> {
    return await this.prismaUserService.updateUser({
      where: {
        id: id
      },
      data: {
        twoFactor: false
      }
    });
  }

  async generateTwoFactorSecret(user: any): Promise<any> {
    const secret: string = authenticator.generateSecret();
    const url: string = authenticator.keyuri(user.id, 'Transcendence', secret); // link to id since this is unique and can't be changed

    console.log('💚 2FA secret generated for user', user.name);
    await this.prismaUserService.updateUser({
      where: {
        id: user.id
      }, 
      data: {
        secret: secret
      }
    });

    return {
      secret,
      url,
    };
  }

  async generateQRCode(url: string): Promise<string> {
    return toDataURL(url);
  }

  async verifyTwoFactorCode(user: any, code: string): Promise<boolean> {
    return authenticator.verify({
      token: code,
      secret: user.secret
    });
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
