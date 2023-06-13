import { Controller, Get, Param, Post, Request, Response, UseGuards, HttpStatus, Query, UseInterceptors, UploadedFile, ForbiddenException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCookieAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaUserService } from './prisma/prismaUser.service';
import * as fs from 'fs';
import { StatusService } from 'src/status/status.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ErrorDto } from './dto/user.dto';

enum Debug {
  ENABLED = 0
}

@Controller('user')
@ApiCookieAuth()
@ApiTags('user')
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: Object })
export class UserController {
  constructor(
    private readonly userService: PrismaUserService,
    private readonly statusService: StatusService
  ) { }

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
  @ApiOkResponse({ description: 'User name updated', type: Object })
  @ApiBadRequestResponse({ description: 'Reason why request was bad', type: ErrorDto })
  async updateMe(@Request() req: any, @Response() res: any) {
    const nameToBeUpdated = req.body.name;

    if (!nameToBeUpdated) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Name is required' });
    }

    if (nameToBeUpdated.length < 3 || nameToBeUpdated.length > 20) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Name length must be between 3 and 20 characters' });
    }

    if (!/^[a-zA-Z0-9-_. ]+$/.test(nameToBeUpdated)) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Name can only contain letters, numbers, spaces and the following special characters: - _ .' });
    }

    const user = await this.userService.user({ name: nameToBeUpdated });
    if (user) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Name already taken' });
    }

    await this.userService.updateUser({
      where: {
        id: Number(req.user.id),
      },
      data: {
        name: req.body.name
      }
    });

    return res.status(HttpStatus.OK).send({ message: 'User updated' });
  }

  @Get('me/picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user picture for current user' })
  @ApiOkResponse({ description: 'User picture found', type: String })
  async getMePicture(@Request() req: any, @Response() res: any) {
    const picturePath = `http://${process.env.CODAM_PC}:${process.env.BACKEND_PORT}/public/user_${req.user.id}.png`;
    return res.status(HttpStatus.OK).send(picturePath);
  }

  @Post('me/picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiOperation({ summary: 'Update user picture for current user, must be a png image (max 1MB)' })
  @ApiOkResponse({ description: 'User picture updated' })
  @ApiBadRequestResponse({ description: 'Reason why request was bad' })
  async updateMePicture(@Request() req: any, @Response() res: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).send('Picture is required, please make sure "picture" is present in the body of the request');
    }

    if (file.mimetype.startsWith('image/') === false) {
      return res.status(HttpStatus.BAD_REQUEST).send('Picture must be an image');
    }

    if (file.size > 1000000) {
      return res.status(HttpStatus.BAD_REQUEST).send('Picture size must be less than 1MB');
    }

    const filename = `user_${req.user.id}.png`;
    const picturePath = '/usr/src/app/public/' + filename;

    fs.writeFileSync(picturePath, file.buffer);
    return res.status(HttpStatus.OK).send('User picture updated');
  }

  @Get('me/friends')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get friends for current user' })
  @ApiOkResponse({ description: 'Friends found', type: [Number] })
  async getMeFriends(@Request() req: any, @Response() res: any) {
    const user = await this.userService.user({ id: Number(req.user.id) });
    if (user === undefined)
      throw new ForbiddenException('user does not exist');
    const friends = user.friends;
    return res.status(HttpStatus.OK).send(friends);
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user information for user with id' })
  @ApiOkResponse({ description: 'User information', type: Object })
  @ApiNotFoundResponse({ description: 'User with id not found', type: String })
  async getUserById(
    @Param('id') id: number,
    @Query('withGames') withGames: boolean = false,
    @Query('withStatus') withStatus: boolean = false,
    @Response() res: any
  ) {
    const userId = Number(id);

    let user: any;
    if (withGames) {
      user = await this.userService.userWithGames({ id: userId });
    } else {
      user = await this.userService.user({ id: userId });
    }

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send(`User with id ${userId} not found`);
    }

    if (withStatus) {
      user.status = await this.statusService.getStatus(userId);
    }

    return res.status(HttpStatus.OK).send(user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'Users found', type: [Object] })
  async getUsers(@Response() res: any) {
    const users = await this.userService.users({});
    if (users === undefined)
      throw new ForbiddenException('users not found');
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
    const myId = Number(req.user.id);
    userId = Number(userId);
    if (Debug.ENABLED)
      console.log('myid, userid', myId, userId);
    const meAsUser = await this.userService.user({ id: myId });
    const otherAsUser = await this.userService.user({ id: userId });
    if (otherAsUser === undefined || meAsUser === undefined)
      throw new ForbiddenException('user or users not found');
    if (otherAsUser.blocked.includes(myId))
      throw new ForbiddenException('friendship could not be established, you are blocked');
    if (meAsUser.blocked.includes(userId))
      throw new ForbiddenException('friendship could not be established, you blocked them. unblock first');
    if (meAsUser.pending.includes(userId)) {
      meAsUser.friends.push(userId);
      meAsUser.pending.splice(meAsUser.pending.indexOf(userId), 1); // removes the pending request
      otherAsUser.friends.push(myId);
      if (Debug.ENABLED)
        console.log('measuser', meAsUser);
      this.userService.updateUser({
        where: {
          id: myId,
        },
        data: {
          friends: meAsUser.friends,
          pending: meAsUser.pending,
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
      return { status: 'friend' }; // well done you are now friends
    }
    // I LEFT HERE WITH CHECKING
    if (otherAsUser.pending.includes(myId))
      return;
    otherAsUser.pending.push(myId);
    const updateCatcher = await this.userService.updateUser({
      where: {
        id: otherAsUser.id,
      },
      data: {
        pending: otherAsUser.pending,
      }
    });
    if (updateCatcher === undefined)
      throw new ForbiddenException('friendship could not be established');
    return { status: 'pending' }; // wait till they accept your request (spannend!)
  }

  // not needed
  // unfriends removes each other from friends onboth sides
  @UseGuards(JwtAuthGuard)
  @Post('unfriend')
  async handleUnfriend(@Request() req: any, @Query('id') userId: number) {
    const myId = Number(req.user.id);
    userId = Number(userId);
    const meAsUser = await this.userService.user({ id: myId });
    const otherAsUser = await this.userService.user({ id: userId });
    if (otherAsUser.pending.includes(myId)) {
      otherAsUser.pending.splice(otherAsUser.pending.indexOf(myId), 1);
      this.userService.updateUser({
        where: {
          id: userId,
        },
        data: {
          pending: otherAsUser.pending,
        }
      });
      return { status: 'unPended' };
    }
    if (meAsUser.friends.includes(userId) === false)
      return; // you are not friends!
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
    return { status: 'unFriended' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('block')
  async handleBlock(@Request() req: any, @Query('id') userId: number) {
    const myId = req.user.id;
    if (Debug.ENABLED)
      console.log(`${myId} is blocking ${userId}`);
    userId = Number(userId);
    // add to block on this side
    const meAsUser = await this.userService.user({ id: myId });
    if (Debug.ENABLED)
      console.log('me as user: ', meAsUser);
    if (meAsUser.blocked.includes(userId))
      return;
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
    if (Debug.ENABLED)
      console.log(`${myId} is unblocking ${userId}`);
    userId = Number(userId);
    const meAsUser = await this.userService.user({ id: myId });
    if (!meAsUser.blocked.includes(userId))
      return; // you did not block them
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

  @UseGuards(JwtAuthGuard)
  @Get('onlyFriends')
  async getOnlyFriends(@Request() req: any) {
    const myId = req.user.id;
    const pending = req.user.pending;

    const onlyFriends = await this.userService.onlyFriends(myId);
    const onlyPending = await this.userService.onlyPending(pending);

    for (const item of onlyFriends) {
      item.status = await this.statusService.getStatus(item.id);
    }
    for (const item of onlyPending) {
      item.status = await this.statusService.getStatus(item.id);
    }

    return { onlyFriends, onlyPending };
  }
}
