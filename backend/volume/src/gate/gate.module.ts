import { Module } from '@nestjs/common';
import { GateService } from './gate.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GateService],
  exports: [GateService],
})
export class GateModule {}