import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    TwoFactorAuthenticationController,
  ],
  providers: [
    TwoFactorAuthenticationService,
    PrismaUserService,
  ],
  exports: [
    TwoFactorAuthenticationService,
  ],
})
export class TwoFactorAuthenticationModule {}