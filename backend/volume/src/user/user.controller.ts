import {
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { User as UserModel} from '@prisma/client';
import { PrismaUserService } from './prisma/prismaUser.service';

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

  @Put('chname/:new')
  async changeName(@Param('new') updatedName: string): Promise<UserModel> {
    return this.userService.updateUser({
      where: {
        id: 2, //set to loged in userId
      },
      data: {
        name: updatedName,
      },
    })
  }

  // @Post('postuserwithname/:name')
  // async postUser(): Promise<UserModel> {
  //   return this.userService.createUser({userdetails});
  // }
}