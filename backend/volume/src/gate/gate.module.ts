import { Module } from '@nestjs/common';
import { GateService } from './gate.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    GateService,
    {
      provide: 'chatGate',
      useFactory: () => new GateService(),
      inject: [GateService],
    },
    {
      provide: 'gameGate',
      useFactory: () => new GateService(),
      inject: [GateService],
    },
    {
      provide: 'statusGate',
      useFactory: () => new GateService(),
      inject: [GateService],
    },
  ],
  exports: ['chatGate', 'gameGate', 'statusGate'],
})
export class GateModule {}