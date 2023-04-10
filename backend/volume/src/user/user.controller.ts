import { Controller, Get, Param, Put, Request, Response, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiResponseProperty, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaUserService } from './prisma/prismaUser.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('user')
@ApiCookieAuth()
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: PrismaUserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User information', type: Object })
  async getMe(@Request() req: any, @Response() res: any) {
    res.status(HttpStatus.OK).send(req.user);
  }

  @Put('me/name')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user name for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User name updated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Name is required, please make sure "name" is present in the body of the request', type: String })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Name already taken', type: String })
  async updateMe(@Request() req: any, @Response() res: any) {
    const nameToBeUpdated = req.body.name;

    if (!nameToBeUpdated) {
      res.status(HttpStatus.BAD_REQUEST).send('Name is required, please make sure "name" is present in the body of the request');
    }

    const user = await this.userService.user({ name: nameToBeUpdated });
    if (user) {
      res.status(HttpStatus.BAD_REQUEST).send('Name already taken');
    }

    this.userService.updateUser({
      where: {
        id: Number(req.user.id),
      },
      data: {
        name: req.body.name
      }
    });

    res.status(HttpStatus.OK).send('User updated');
  }

  /* Untested */
  @Put('me/picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user picture for current user (NEEDS TESTING)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User picture updated', type: String })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Picture is required, please make sure "picture" is present in the body of the request', type: String })
  async updateMePicture(@Request() req: any, @Response() res: any) {
    const pictureToBeUpdated = req.body.picture;

    if (!pictureToBeUpdated) {
      res.status(HttpStatus.BAD_REQUEST).send('Picture is required, please make sure "picture" is present in the body of the request');
    }

    const ext = path.extname(pictureToBeUpdated.name);
    const filename = `${req.user.id}${ext}`;
    const picturePath = '/usr/src/app/public/' + filename;

    fs.writeFileSync(picturePath, pictureToBeUpdated.data);

    res.status(HttpStatus.OK).send('User picture updated');
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for user with id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User information', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User with id not found', type: String })
  async getUserById(@Param('id') id: string, @Response() res: any) {
    const user = await this.userService.user({ id: Number(id) });
    
    if (!user) {
      res.status(HttpStatus.NOT_FOUND).send(`User with id ${id} not found`);
    }

    res.status(HttpStatus.OK).send(user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All users', type: Object })
  async getUsers(@Response() res: any) {
    const users = await this.userService.users({});
    res.status(HttpStatus.OK).send(users);
  }
}
