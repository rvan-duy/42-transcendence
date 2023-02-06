import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module'

// import only the modules which provide the controllers

@Module({
  imports: [UserModule],
  controllers: [AppController], // is here for the cat only
  providers: [],
})
export class AppModule {}
