import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
console.log(process.env); // debug

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const config = new DocumentBuilder()
    .setTitle('Transcendence API')
    .setDescription('API for Transcendence project')
    .setVersion('1.0')
    .addCookieAuth('JWT Token', { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  const allowed_origins: string[] = ['*', 'https://api.intra.42.fr', 'http://localhost:8000', 'http://127.0.0.1:8000'];
  for (let f=0; f<2; f++)
  {
    for(let r=1; r<7; r++)
    {
      for(let s=1; s<30; s++)
      {
        const dns_for_imac = 'http://f'+f+'r'+r+'s'+s+'.codam.nl:8000';
        allowed_origins.push(dns_for_imac);
      }
    }
  }
  app.enableCors( {
    origin: allowed_origins,
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
      secret: process.env.FORTYTWO_CLIENT_SECRET, // i have no idea what this is, but it's required
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
