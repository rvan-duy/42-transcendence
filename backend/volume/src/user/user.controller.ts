import { Controller, Get, Param, Post, Request, Response, UseGuards, HttpStatus, Query } from '@nestjs/common';
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
    return res.status(HttpStatus.OK).send(friends);
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for user with id' })
  @ApiOkResponse({ description: 'User information', type: Object })
  @ApiNotFoundResponse({ description: 'User with id not found', type: String })
  async getUserById(@Param('id') id: string, @Response() res: any, @Query('withGames') withGames: boolean = false) {
    let user;

    if (withGames)
      user = await this.userService.userWithGames({ id: Number(id) });
    else
      user = await this.userService.user({ id: Number(id) });
    
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
