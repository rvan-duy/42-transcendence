import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PrismaService } from './services/prisma/prisma.service';
import { PrismaService } from './prisma/prisma.service';
// var cors = require('cors')
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
console.log(process.env);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableCors( {
    origin: ['http://localhost:8000', 'http://codam.nl:8000', 'http://f0r6s9.codam.nl:8000', 'http://f0r5s9.codam.nl:8000'],
  });
  await app.listen(3000);
}
bootstrap();
