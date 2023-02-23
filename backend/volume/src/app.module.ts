import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatGatewayModule } from './chat/chat.module';

// import only the modules which provide the controllers

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ChatGatewayModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
