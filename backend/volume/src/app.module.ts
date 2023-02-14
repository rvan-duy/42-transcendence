import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, GatewayModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
