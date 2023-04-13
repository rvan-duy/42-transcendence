import { Controller, Get, Param, Post, Request, Response, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCookieAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaUserService } from './prisma/prismaUser.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('user')
@ApiCookieAuth()
@ApiTags('user')
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: Object })
export class UserController {
  constructor(private readonly userService: PrismaUserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for current user' })
  @ApiOkResponse({ description: 'User information', type: Object })
  async getMe(@Request() req: any, @Response() res: any) {
    return res.status(HttpStatus.OK).send(req.user);
  }

  @Post('me/name')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user name for current user' })
  @ApiBody({ type: Object, description: 'Name to be updated' })
  @ApiOkResponse({ description: 'User name updated' })
  @ApiBadRequestResponse({ description: 'Reason why request was bad' })
  async updateMe(@Request() req: any, @Response() res: any) {
    const nameToBeUpdated = req.body.name;

    if (!nameToBeUpdated) {
      return res.status(HttpStatus.BAD_REQUEST).send('Name is required, please make sure "name" is present in the body of the request');
    }

    if (nameToBeUpdated.length < 3 || nameToBeUpdated.length > 20) {
      return res.status(HttpStatus.BAD_REQUEST).send('Name length must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9-_. ]+$/.test(nameToBeUpdated)) {
      return res.status(HttpStatus.BAD_REQUEST).send('Name can only contain letters, numbers, spaces and the following special characters: - _ .');
    }

    const user = await this.userService.user({ name: nameToBeUpdated });
    if (user) {
      return res.status(HttpStatus.BAD_REQUEST).send('Name already taken');
    }

    await this.userService.updateUser({
      where: {
        id: Number(req.user.id),
      },
      data: {
        name: req.body.name
      }
    });

    return res.status(HttpStatus.OK).send('User updated');
  }

  @Get('me/picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user picture for current user' })
  @ApiOkResponse({ description: 'User picture found', type: String })
  async getMePicture(@Request() req: any, @Response() res: any) {
    const picturePath = `http://${process.env.CODAM_PC}:${process.env.BACKEND_PORT}/public/user_${req.user.id}.jpg`;
    return res.status(HttpStatus.OK).send(picturePath);
  }

  /* Untested */
  @Post('me/picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user picture for current user (NEEDS TESTING)' })
  @ApiOkResponse({ description: 'User picture updated' })
  @ApiBadRequestResponse({ description: 'Reason why request was bad' })
  async updateMePicture(@Request() req: any, @Response() res: any) {
    const pictureToBeUpdated = req.body.picture;

    if (!pictureToBeUpdated) {
      return res.status(HttpStatus.BAD_REQUEST).send('Picture is required, please make sure "picture" is present in the body of the request');
    }

    const ext = path.extname(pictureToBeUpdated.name);
    const filename = `${req.user.id}${ext}`;
    const picturePath = '/usr/src/app/public/' + filename;

    fs.writeFileSync(picturePath, pictureToBeUpdated.data);

    return res.status(HttpStatus.OK).send('User picture updated');
  }

  @Get('me/friends')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get friends for current user' })
  @ApiOkResponse({ description: 'Friends found', type: [Number] })
  async getMeFriends(@Request() req: any, @Response() res: any) {
    const user = await this.userService.user({ id: Number(req.user.id) });
    const friends = user.friends;
    res.status(HttpStatus.OK).send(friends);
  }

  @Post('me/friends/add/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'TODO: Add friend for current user' })
  async addMeFriend(@Request() req: any, @Param('id') id: string, @Response() res: any) {
    //TODO
    return res.status(HttpStatus.OK).send('TODO')
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for user with id' })
  @ApiOkResponse({ description: 'User information', type: Object })
  @ApiNotFoundResponse({ description: 'User with id not found', type: String })
  async getUserById(@Param('id') id: string, @Response() res: any) {
    const user = await this.userService.user({ id: Number(id) });
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send(`User with id ${id} not found`);
    }

    return res.status(HttpStatus.OK).send(user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'Users found', type: [Object] })
  async getUsers(@Response() res: any) {
    const users = await this.userService.users({});
    return res.status(HttpStatus.OK).send(users);
  }
}
