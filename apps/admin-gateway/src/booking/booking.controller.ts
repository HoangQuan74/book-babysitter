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
  QueryBookingDto,
  QueryUserDto,
} from './dto';
import {
  EBookingStatus,
  ELanguage,
  EService,
  EUserRole,
} from '@lib/common/enums';
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

  @Get('/')
  async getBookings(@Query() query: QueryBookingDto) {
    return await this.messageBuilder.sendMessage(EService.BOOKING, query, {
      cmd: BookingController.prototype.getBookings.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/:bookCode')
  async getBookingById(
    @Param('bookCode') bookCode: string,
    @LanguageCode() lang: ELanguage,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { bookCode, lang },
      {
        cmd: BookingController.prototype.getBookingById.name,
      },
    );
  }

  @Get('/users/user-code')
  async getUserByUserCode(@Query() query: QueryUserDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, query, {
      cmd: BookingController.prototype.getUserByUserCode.name,
    });
  }

  @Post('/')
  async createBooking(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: CreateBookingDto,
  ) {
    const result = await this.messageBuilder.sendMessage(
      EService.BOOKING,
      { reqUser, data },
      {
        cmd: BookingController.prototype.createBooking.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: data.parentId,
      babysitterId: data.babysitterId,
      type: EBookingStatus.PENDING,
    });

    return result;
  }

  @Patch('/cancel')
  async cancelBooking(@Body() data: CancelBookingDto) {
    const result = await this.messageBuilder.sendMessage(
      EService.BOOKING,
      data,
      {
        cmd: BookingController.prototype.cancelBooking.name,
      },
    );

    this.socketClientService.emitBookingStatusChange({
      parentId: result.parentId,
      babysitterId: result.babysitterId,
      type:
        data.canceledBy === EUserRole.PARENT
          ? EBookingStatus.PARENT_CANCEL
          : EBookingStatus.BABY_SITTER_CANCEL,
    });

    return result;
  }
}
