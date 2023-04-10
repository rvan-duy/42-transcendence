import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly prismaUserService: PrismaUserService,
  ) {}

  async verifyTwoFactorCode(userId: any, code: string): Promise<boolean> {
    const user = await this.prismaUserService.user({ id: Number(userId) });
    const isVerified: boolean = authenticator.verify({
      token: code,
      secret: user.secret,
    });

    console.log(isVerified ? '✅' : '❌', '2FA verification for', user.name, isVerified ? 'succeeded' : 'failed');
    return isVerified;
  }

  async getTwoFactorSecret(userId: any): Promise<string> {
    const user = await this.prismaUserService.user({ id: Number(userId) });
    return user.secret;
  }

  async turnOnTwoFactorForUser(userId: any): Promise<void> {
    this.prismaUserService.updateUser({
      where: {
        id: Number(userId),
      },
      data: {
        twoFactor: true,
      },
    });
    console.log('🔒 2FA turned on');
  }

  async turnOffTwoFactorForUser(userId: any): Promise<void> {
    this.prismaUserService.updateUser({
      where: {
        id: Number(userId),
      },
      data: {
        twoFactor: false,
      },
    });
    console.log('🔓 2FA turned off');
  }

  async generateTwoFactorSecret(user: User): Promise<any> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(`user_${String(user.id)}`, '42_Transcendence_RubenPong', secret);

    const userData = await this.prismaUserService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        secret: secret,
      },
    });
    console.log('🔑 2FA secret generated for', userData.name);

    return {
      secret,
      otpauthUrl,
    };
  }

  async pipeQrCode(res: Response, otpauthUrl: string): Promise<any> {
    res.header('Content-Type', 'image/png');
    return toFileStream(res, otpauthUrl);
  }

}