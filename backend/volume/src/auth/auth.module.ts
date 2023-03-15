import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CookieStore } from './cookie.store';
import { LocalGuard } from './cookie.guard';

@Module({
  imports: [PrismaModule],
  providers: [AuthService, PrismaUserService, CookieStore, LocalGuard],
  controllers: [AuthController],
  exports: [LocalGuard],
})

export class AuthModule {}