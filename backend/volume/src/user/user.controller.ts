import { Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { User as UserModel} from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaUserService } from './prisma/prismaUser.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: PrismaUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any): Promise<UserModel> {
    return this.userService.user({ id: Number(req.user.id) });
  }

  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    return this.userService.user({ id: Number(id) });
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  // TODO: add a way to change the name of the user
  @Put('chname/:new')
  async changeName(@Param('new') updatedName: string): Promise<UserModel> {
    return this.userService.updateUser({
      where: {
        id: 2, //set to loged in userId
      },
      data: {
        name: updatedName,
      },
    });
  }

  // @Post('postuserwithname/:name')
  // async postUser(): Promise<UserModel> {
  //   return this.userService.createUser({userdetails});
  // }
}