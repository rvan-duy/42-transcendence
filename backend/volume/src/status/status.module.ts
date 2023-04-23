import { Module } from '@nestjs/common';
import { GateModule } from 'src/gate/gate.module';
import { StatusService } from './status.service';

@Module({
  imports: [GateModule],
  controllers: [],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}