import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user/userController.service';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
