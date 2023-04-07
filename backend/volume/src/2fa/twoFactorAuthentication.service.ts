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

  async generateTwoFactorSecret(user: User): Promise<any> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(`user_${String(user.id)}`, '42_Transcendence_RubenPong', secret);
    
    const userData = await this.prismaUserService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        twoFactor: true,
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
    res.header('Content-Type', 'image/png')
    return toFileStream(res, otpauthUrl);
  }

}