import {
  Controller,
  Get,
} from '@nestjs/common';
  
  @Controller('auth')
export class AuthController {
  constructor(
  ) {}
  
    @Get('callback')
  async callbackReceiver() {
    console.log('callbackReceiver');

    return 'callbackReceiver';
  }
}