import { Module } from '@nestjs/common';
import { PrismaRoomModule } from './prisma/prismaRoom.module';
import { PrismaRoomService } from './prisma/prismaRoom.service';

@Module({
  imports: [PrismaRoomModule],
  controllers: [],
  providers: [PrismaRoomService],
  exports: [PrismaRoomService],
})
export class RoomModule {}