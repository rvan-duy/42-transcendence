import { Module } from '@nestjs/common';
import { CryptService } from './crypt.service';

@Module({
  exports: [CryptService],
})
export class CryptModule {}