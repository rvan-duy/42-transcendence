import { Module } from '@nestjs/common';
import { GateModule } from 'src/gate/gate.module';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { StatusGateway } from './status.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [GateModule,
    JwtModule,
  ],
  controllers: [StatusController],
  providers: [StatusService, StatusGateway],
  exports: [StatusService],
})
export class StatusModule {}