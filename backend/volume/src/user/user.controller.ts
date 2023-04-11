import { Controller, Get, Param, Put, Post, Request, Response, UseGuards, HttpStatus, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaUserService } from './prisma/prismaUser.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: PrismaUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any, @Response() res: any) {
    const user = await this.userService.user({ id: Number(req.user.id) });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).send('User not found');
    }

    res.status(HttpStatus.OK).send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
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
        name: req.user.name
      },
      data: {
        name: req.body.name
      }
    });

    res.status(HttpStatus.OK).send('User updated');
  }

  /* Untested */
  @UseGuards(JwtAuthGuard)
  @Put('me/picture')
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

  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  async getUserById(@Param('id') id: number, @Response() res: any, @Query('withGames') withGames: boolean = false) {
    let user;
    if (withGames)
      user = await this.userService.userWithGames({ id: Number(id) });
    else
      user = await this.userService.user({ id: Number(id) });
    
    if (!user) {
      res.status(HttpStatus.NOT_FOUND).send(`User with id ${id} not found`);
    }

    res.status(HttpStatus.OK).send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getUsers(@Response() res: any) {
    const users = await this.userService.users({});

    if (!users) {
      res.status(HttpStatus.NOT_FOUND).send('No users found');
    }

    res.status(HttpStatus.OK).send(users);
  }

  @UseGuards(JwtAuthGuard)
  @Post('befriend')
  async handleFriendRequest(@Request() req: any, @Query('id') userId: number) {
    // is this user blocked by other user?
      // do not do anything maybe return a negative response
    // did the other user already send a friend request?
      // add as friends on both sides
    // set pending on this side
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfriend')
  async handleUnfriend(@Request() req: any, @Query('id') userId: number) {
    // remove as friends from both sides
  }

  @UseGuards(JwtAuthGuard)
  @Post('block')
  async handleBlock(@Request() req: any, @Query('id') userId: number) {
    // add to block on this side
    // unfriend in case they where friends
  }

  @UseGuards(JwtAuthGuard)
  @Post('unblock')
  async handleUnBlock(@Request() req: any, @Query('id') userId: number) {
    // unblock on this users side
  }
}
