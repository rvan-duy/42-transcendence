import { Module } from '@nestjs/common';
import { FortyTwoStrategy } from './forty-two.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaUserService } from 'src/user/prisma/prismaUser.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaUserService, JwtStrategy, FortyTwoStrategy],
  exports: [AuthService],
})
export class AuthModule {}
