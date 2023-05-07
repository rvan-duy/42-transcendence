import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(
    private statusService: StatusService,
  ){}

  @Get('test')
  printConnections() {
    this.statusService.listConnections();
  }
}
