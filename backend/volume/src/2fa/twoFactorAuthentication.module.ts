import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    TwoFactorAuthenticationController,
  ],
  providers: [
    TwoFactorAuthenticationService,
    AuthService,
    PrismaUserService,
  ],
  exports: [
    TwoFactorAuthenticationService,
  ],
})
export class TwoFactorAuthenticationModule {}