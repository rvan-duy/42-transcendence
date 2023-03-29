import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PrismaRoomModule } from './prisma/prismaRoom.module';
import { RoomService } from './room.service';

@Module({
  imports: [PrismaRoomModule, UserModule],
  controllers: [],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}