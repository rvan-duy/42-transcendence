import { Module } from '@nestjs/common';
import { GateModule } from 'src/gate/gate.module';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';

@Module({
  imports: [GateModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}