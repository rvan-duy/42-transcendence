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
  
  // is this user blocked by other user?
  // do not do anything maybe return a negative response
  // did the other user already send a friend request?
  // add as friends on both sides
  // set pending on this side
  @UseGuards(JwtAuthGuard)
  @Post('befriend')
  async handleFriendRequest(@Request() req: any, @Query('id') userId: number) {
    const myId = req.user.id;
    const meAsUser = await this.userService.user({id: myId});
    const otherAsUser = await this.userService.user({id: userId});
    if (otherAsUser === undefined)
      return ;
    if (otherAsUser.blocked.includes(myId))
      return ; // they blocked you do not try and freind!!
    if (meAsUser.blocked.includes(userId))
      return ; // you blocked them do not be silly!
    if (meAsUser.pending.includes(userId))
    {
      meAsUser.friends.push(userId);
      meAsUser.pending.splice(meAsUser.pending.indexOf(userId), 1); // removes the pending request
      otherAsUser.friends.push(myId);
      this.userService.updateUser({
        where: {
          id: myId,
        },
        data: {
          friends: meAsUser.friends,
        }
      });
      return ; // well done you are now friends
    }
    otherAsUser.pending.push(myId);
    this.userService.updateUser({
      where: {
        id: otherAsUser.id,
      },
      data: {
        pending: otherAsUser.pending,
      }
    });
    return ; // wait till they accept your request (spannend!)
  }

  // not needed
  // unfriends removes each other from friends onboth sides
  @UseGuards(JwtAuthGuard)
  @Post('unfriend')
  async handleUnfriend(@Request() req: any, @Query('id') userId: number) {
    const myId = req.user.id;
    const meAsUser = await this.userService.user({id: myId});
    const otherAsUser = await this.userService.user({id: userId});
    if (meAsUser.friends.includes(userId) === false)
      return ; // you are not friends!
    meAsUser.friends.splice(meAsUser.friends.indexOf(userId), 1); // removes the friend :(
    otherAsUser.friends.splice(otherAsUser.friends.indexOf(myId), 1); // removes the friend :(
    this.userService.updateUser({
      where: {
        id: myId,
      },
      data: {
        friends: meAsUser.friends,
      }
    });
    this.userService.updateUser({
      where: {
        id: userId,
      },
      data: {
        friends: otherAsUser.friends,
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('block')
  async handleBlock(@Request() req: any, @Query('id') userId: number) {
    const myId = req.user.id;
    // add to block on this side
    const meAsUser = await this.userService.user(myId);
    meAsUser.blocked.push(userId);
    this.userService.updateUser({
      where: {
        id: myId,
      },
      data: {
        blocked: meAsUser.blocked,
      },
    });
    // unfriend in case they where friends
    this.handleUnfriend(req, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unblock')
  async handleUnBlock(@Request() req: any, @Query('id') userId: number) {
    const myId = req.user.id;
    const meAsUser = await this.userService.user(myId);
    if (meAsUser.blocked.includes(userId) === false)
      return ; // you did not blcok them
    // unblock on this users side
    meAsUser.blocked.splice(meAsUser.blocked.indexOf(userId), 1);
    this.userService.updateUser({
      where: {
        id: myId,
      },
      data: {
        blocked: meAsUser.blocked,
      },
    });
  }
}
