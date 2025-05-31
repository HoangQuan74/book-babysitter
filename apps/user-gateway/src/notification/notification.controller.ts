import { Controller, Get, Param, Query } from '@nestjs/common';
import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { PagingDto } from '@lib/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestUser } from '@lib/common/decorator';

@Controller('notification')
@ApiBearerAuth()
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('general')
  getGeneralNotification(@RequestUser() user, @Query() query: PagingDto) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { ...query, user },
      {
        cmd: NotificationController.prototype.getGeneralNotification.name,
      },
    );
  }

  @Get('general/:id')
  getGeneralNotificationDetail(@RequestUser() user, @Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { id, user },
      {
        cmd: NotificationController.prototype.getGeneralNotificationDetail.name,
      },
    );
  }
}
