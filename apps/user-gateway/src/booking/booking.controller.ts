import { EBookingStatus, EService, EUserRole } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CancelBookingDto,
  CreateBookingDto,
  QueryBookingBabysitterDto,
  QueryBookingDto,
  QueryBookingNotificationDto,
  QueryBookingScheduleDto,
} from './dto';
import { LanguageCode, RequestUser } from '@lib/common/decorator';
import { IRequestUser } from '@lib/common/interfaces';
import { SocketClientService } from '../socket-client/socket-client.service';

@ApiBearerAuth()
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(
    private readonly messageBuilder: MessageBuilder,
    private readonly socketClientService: SocketClientService,
  ) {}

  @ApiSecurity('X-LANG-CODE')
  @Post('babysitter')
  getBabysitterForBooking(
    @Body() query: QueryBookingBabysitterDto,
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { query: { ...query, lang }, reqUser },
      {
        cmd: BookingController.prototype.getBabysitterForBooking.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Post('')
  createBookingParent(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: string,
    @Body() data: CreateBookingDto,
  ) {
    const result = this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, data: { parentId: reqUser.userId, ...data } },
      {
        cmd: BookingController.prototype.createBookingParent.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: reqUser.userId,
      babysitterId: data.babysitterId,
      type: EBookingStatus.PENDING,
    });

    return result;
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('')
  getUserBookings(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: string,
    @Query() query: QueryBookingDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, query, lang },
      {
        cmd: BookingController.prototype.getUserBookings.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Patch('confirm/:bookingId')
  async confirmBooking(
    @Param('bookingId') bookingId: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    const result = await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, bookingId },
      {
        cmd: BookingController.prototype.confirmBooking.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: result.parentId,
      babysitterId: result.babysitterId,
      type: EBookingStatus.CONFIRMED,
    });

    return result;
  }

  @ApiSecurity('X-LANG-CODE')
  @Patch('cancel/:bookingId')
  async cancelBooking(
    @Param('bookingId') id: string,
    @RequestUser() reqUser: IRequestUser,
    @Body() { reasonCancel }: CancelBookingDto,
  ) {
    const result = await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { id, canceledBy: reqUser.role, reasonCancel },
      {
        cmd: BookingController.prototype.cancelBooking.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: result.parentId,
      babysitterId: result.babysitterId,
      type:
        reqUser.role === EUserRole.PARENT
          ? EBookingStatus.PARENT_CANCEL
          : EBookingStatus.BABY_SITTER_CANCEL,
    });

    return result;
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('schedules')
  getBookingSchedules(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: string,
    @Query() query: QueryBookingScheduleDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, query, lang },
      {
        cmd: BookingController.prototype.getBookingSchedules.name,
      },
    );
  }

  @Get('notifications')
  getBookingNotifications(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: QueryBookingNotificationDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, query },
      {
        cmd: BookingController.prototype.getBookingNotifications.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/draft/:babysitterId')
  getBookingDraftWithBabysitter(
    @Param('babysitterId') babysitterId: string,
    @LanguageCode() lang: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { babysitterId, lang, reqUser },
      {
        cmd: BookingController.prototype.getBookingDraftWithBabysitter.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get(':id')
  getBookingById(
    @Param('id') id: string,
    @LanguageCode() lang: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { id, lang, reqUser },
      {
        cmd: BookingController.prototype.getBookingById.name,
      },
    );
  }
}
