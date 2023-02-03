import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { PrismaGameModule } from './game/prismaGame.module';
import { PrismaMsgModule } from './msg/prismaMsg.module';
import { PrismaRoomModule } from './Room/prismaMsg.module';
import { PrismaUserModule } from './user/prismaUser.module';

@Module({
  imports: [PrismaClient,
    PrismaGameModule,
    PrismaMsgModule,
    PrismaRoomModule,
    PrismaUserModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}