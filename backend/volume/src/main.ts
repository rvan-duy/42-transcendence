import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PrismaService } from './services/prisma/prisma.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
  app.enableCors(    { 
    origin: ['http://localhost:8000', 'http://localhost:3000'],
  });
  await app.listen(3000);
}
bootstrap();
