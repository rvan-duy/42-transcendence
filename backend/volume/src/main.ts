import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport'
import * as dotenv from 'dotenv';

dotenv.config();
console.log(process.env);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableCors( {
    origin: ['*', 'http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
