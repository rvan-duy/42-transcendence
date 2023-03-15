import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
import { PrismaUserService } from './user/prisma/prismaUser.service';

dotenv.config();
console.log(process.env); // debug

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableCors( {
    origin: ['*'],
  });
  app.use(
    session({
      cookie: {
        maxAge: 3600 * 24 * 1000,
        httpOnly: false,
        secure: false,
		  },
		  name: 'transcendence',
      secret: process.env.APPLICATION_SECRET, // i have no idea what this is, but it's required
		  resave: false,
		  saveUninitialized: false,
	  })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
}
bootstrap();

const FortyTwoStrategy = require('passport-42').Strategy;

passport.use(new FortyTwoStrategy({
    clientID: process.env.APPLICATION_ID,
    clientSecret: process.env.APPLICATION_SECRET,
    callbackURL: process.env.REDIRECT_URI,
    profileFields: {
      'id': function (obj) { return obj.id; },
      'username': 'login',
      // 'photos.0.value': 'image_url' use this later
    }
  },
  async function(accessToken, refreshToken, profile, cb) {
    const userService: PrismaUserService = new PrismaUserService(new PrismaService());
    await userService.findOrCreateUser({
      intraId: profile.id,
      name: profile.username,
    })
    return (cb(null, profile));
  }
));
