import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module'

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
