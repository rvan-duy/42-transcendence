import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserControllerModule } from './controllers/user/userController.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [PrismaModule, UserControllerModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
