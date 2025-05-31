import { RequestUser } from '@lib/common/decorator';
import { EService, EUserRole } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRatingUserDto } from './dto';
import { IRequestUser } from '@lib/common/interfaces';
import { PaginationQueryDto } from '@lib/common/query';
import { SocketClientService } from '../socket-client/socket-client.service';

@ApiTags('Rating')
@Controller('rating')
@ApiBearerAuth()
export class RatingController {
  constructor(
    private readonly messageBuilder: MessageBuilder,
    private readonly socketClientService: SocketClientService,
  ) {}

  @Post('')
  async createRatingBabysitter(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: CreateRatingUserDto,
  ) {
    if (reqUser.role !== EUserRole.PARENT) return false;

    const result = await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, data },
      {
        cmd: RatingController.prototype.createRatingBabysitter.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: reqUser.userId,
      babysitterId: data.babysitterId,
      type: 'new_rating',
    });
    return result;
  }

  @Get('')
  getRatingNotification(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, query },
      {
        cmd: RatingController.prototype.getRatingNotification.name,
      },
    );
  }

  @Delete(':id')
  deleteRatingBabysitter(@RequestUser() reqUser, @Param('id') id: string) {
    if (reqUser.role !== EUserRole.PARENT) return false;
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, id },
      {
        cmd: RatingController.prototype.deleteRatingBabysitter.name,
      },
    );
  }

  @Get(':id')
  getRatingBabysitterDetail(@RequestUser() reqUser, @Param('id') id: string) {
    if (reqUser.role !== EUserRole.PARENT) return false;
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, id },
      {
        cmd: RatingController.prototype.getRatingBabysitterDetail.name,
      },
    );
  }

  @Patch(':id')
  seenRatingNotification(
    @RequestUser() reqUser: IRequestUser,
    @Param('id') id: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, id },
      {
        cmd: RatingController.prototype.seenRatingNotification.name,
      },
    );
  }
}
