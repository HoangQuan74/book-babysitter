import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  BabysitterRankingDto,
  CreateBabysitterDto,
  QueryBabysitterDto,
  QueryBabysitterRankingDto,
  QueryUserDeletedDto,
  UpdateListAllowBookingBabysitterDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto';
import { LanguageCode, Permission, RequestUser } from '@lib/common/decorator';
import { IQueryUser, IRequestUser } from '@lib/common/interfaces';
import { PermissionGuard } from '@lib/utils/guards';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('deleted')
  async getUserDeleted(@Query() query: QueryUserDeletedDto) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { query },
      {
        cmd: UserController.prototype.getUserDeleted.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('babysitter')
  async getBabysitters(
    @Query() query: QueryBabysitterDto,
    @LanguageCode() lang: string,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { ...query, lang },
      {
        cmd: UserController.prototype.getBabysitters.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('babysitter/ranking')
  async getBabysitterRanking(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: string,
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

  @Post('babysitter/ranking')
  async saveBabysitterRanking(
    @Body() { babysitterIds, type }: BabysitterRankingDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { babysitterIds, type },
      {
        cmd: UserController.prototype.saveBabysitterRanking.name,
      },
    );
  }

  @Post('babysitter')
  async createBabysitter(
    @Body() data: CreateBabysitterDto,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { data, reqUser },
      {
        cmd: UserController.prototype.createBabysitter.name,
      },
    );
  }

  @UseGuards(PermissionGuard)
  @Permission(UserController.prototype.getProfileUser.name)
  @ApiSecurity('X-LANG-CODE')
  @Post('/profile')
  async getProfileUser(
    @Body() { type, identifier }: UserQueryDto,
    @LanguageCode() lang: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    const search: IQueryUser = { identifier, type };
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { lang, reqUser, search },
      {
        cmd: UserController.prototype.getProfileUser.name,
      },
    );
  }

  @UseGuards(PermissionGuard)
  @Permission(UserController.prototype.updateProfile.name)
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

  @Patch('babysitter/allow-booking')
  async updateBabysitterAllowBookingStatus(
    @Body() { allowBookings: data }: UpdateListAllowBookingBabysitterDto,
  ) {
    return await this.messageBuilder.sendMessage(EService.AUTH, data, {
      cmd: UserController.prototype.updateBabysitterAllowBookingStatus.name,
    });
  }

  @Patch('babysitter/allow-booking/all')
  async updateAllBabysitterAllowBookingStatus() {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      {},
      {
        cmd: UserController.prototype.updateAllBabysitterAllowBookingStatus
          .name,
      },
    );
  }
}
