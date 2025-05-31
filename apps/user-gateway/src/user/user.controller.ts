import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  AppName,
  LanguageCode,
  Public,
  RequestUser,
} from '@lib/common/decorator';
import { ELanguage, EService, EUserRole } from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import {
  CreateCommentDto,
  QueryBabysitterRankingDto,
  QueryRatingUserDetailDto,
  UpdateUserDto,
  UserDeviceDto,
} from './dto';
import { query } from 'express';
import { PaginationQueryDto } from '@lib/common/query';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @ApiSecurity('X-LANG-CODE')
  @Get('my-profile')
  async getProfileUser(
    @LanguageCode() lang: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { lang, reqUser },
      {
        cmd: UserController.prototype.getProfileUser.name,
      },
    );
  }

  @Get('my-profile/review-babysitter')
  async getReviewOfBabysitters(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, query },
      {
        cmd: UserController.prototype.getReviewOfBabysitters.name,
      },
    );
  }

  @Patch('update-profile')
  async updateProfile(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: UpdateUserDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, data },
      {
        cmd: UserController.prototype.updateProfile.name,
      },
    );
  }

  @Post('profile/comment')
  async createComment(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: CreateCommentDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, data },
      {
        cmd: UserController.prototype.createComment.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('profile/:userId')
  async getProfileUserByUserId(
    @Param('userId') userId: string,
    @LanguageCode() lang: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, userId, lang },
      {
        cmd: UserController.prototype.getProfileUserByUserId.name,
      },
    );
  }

  @Get('profile/rating/detail')
  async getRatingUserById(@Query() query: QueryRatingUserDetailDto) {
    const { ratingId } = query;
    return await this.messageBuilder.sendMessage(EService.BOOKING, ratingId, {
      cmd: UserController.prototype.getRatingUserById.name,
    });
  }

  @Delete('user-image/:id')
  async deleteUserImageById(
    @RequestUser() reqUser: IRequestUser,
    @Param('id') id: string,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, id },
      {
        cmd: UserController.prototype.deleteUserImageById.name,
      },
    );
  }

  @Patch('user-image/default/:id')
  async setUserImageAsDefault(
    @RequestUser() reqUser: IRequestUser,
    @Param('id') id: string,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, id },
      {
        cmd: UserController.prototype.setUserImageAsDefault.name,
      },
    );
  }

  @Post('/device')
  createUserDevice(@RequestUser() user, @Body() body: UserDeviceDto) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { user, body },
      {
        cmd: UserController.prototype.createUserDevice.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('babysitter/ranking')
  async getBabysitterRanking(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: ELanguage,
    @Query() { type }: QueryBabysitterRankingDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, lang, type },
      {
        cmd: UserController.prototype.getBabysitterRanking.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('babysitter/favorite')
  async getBabysitterFavorites(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
    @LanguageCode() lang: string,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, query: { ...query, lang } },
      {
        cmd: UserController.prototype.getBabysitterFavorites.name,
      },
    );
  }

  @Post('babysitter/favorite/:babysitterId')
  async toggleBabysitterFavorite(
    @RequestUser() reqUser: IRequestUser,
    @Param('babysitterId') babysitterId: string,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, babysitterId },
      {
        cmd: UserController.prototype.toggleBabysitterFavorite.name,
      },
    );
  }
}
