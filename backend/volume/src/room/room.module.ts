import { Module } from '@nestjs/common';
import { PrismaRoomModule } from './prisma/prismaRoom.module';

@Module({
  imports: [PrismaRoomModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class RoomModule {}