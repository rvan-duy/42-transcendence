import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { User as UserModel} from '@prisma/client';
import { PrismaUserService } from 'src/prisma/user/prismaUser.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: PrismaUserService
    ) {}

  @Get('id/:id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    return this.userService.user({ id: Number(id) });
  }

  @Get('all')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }
}