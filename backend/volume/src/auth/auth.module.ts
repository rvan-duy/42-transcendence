import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FortyTwoStrategy } from './auth.strategy';
import { PassportModule } from '@nestjs/passport';
import * as expressSession from 'express-session';
import * as passport from 'passport';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: true, })
  ],
  providers: [AuthService, PrismaUserService, FortyTwoStrategy],
  controllers: [AuthController],
})

export class AuthModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
	    consumer
	      .apply(
	        expressSession({
	          secret: 'SOME SESSION SECRET',
	          resave: false,
	          saveUninitialized: false,
	        }),
	        passport.session(),
	      )
	      .forRoutes('*');
	  }
}

// export class AuthModule {}