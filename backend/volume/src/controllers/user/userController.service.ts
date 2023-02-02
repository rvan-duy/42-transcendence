import { UserService } from '../../prisma/user.service';
import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { User as UserModel} from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
    ) {}

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserModel> {
    return this.userService.user({ email: email });
  }
}