import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PrismaRoomModule } from './prisma/prismaRoom.module';
import { RoomService } from './room.service';
import { CryptModule } from 'src/crypt/crypt.module';

@Module({
  imports: [PrismaRoomModule, UserModule, CryptModule],
  controllers: [],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}