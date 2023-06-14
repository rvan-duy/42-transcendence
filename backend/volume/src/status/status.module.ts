import { Module } from '@nestjs/common';
import { GateModule } from 'src/gate/gate.module';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { StatusGateway } from './status.gateway';
import { JwtModule } from '@nestjs/jwt';
import { GameStatusModule } from 'src/game/status/game.status.module';

@Module({
  imports: [
    GateModule,
    JwtModule,
    GameStatusModule,
  ],
  controllers: [StatusController],
  providers: [
    StatusService,
    StatusGateway,
  ],
  exports: [StatusService],
})
export class StatusModule {}
