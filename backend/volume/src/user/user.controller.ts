import { Controller, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
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
  @Put('me')
  async updateMe(@Request() req: any): Promise<UserModel> {
    // const user = await this.userService.user({ name: req.body.name });
    // if (user && user.id !== Number(req.user.id)) {
    //   throw new NotFoundException(`Username ${req.body.name} is already taken`);
    // }

    return this.userService.updateUser({ 
      where: { 
        id: Number(req.user.id) 
      }, 
      data: { 
        name: req.body.name 
      } 
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    const user = await this.userService.user({ id: Number(id) });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  
}