import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { Public } from '@lib/common/decorator';
import { PagingDto } from '@lib/common/dto';
import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BatchConfigDto } from './dto';

@Public()
@Controller('batch')
@ApiBearerAuth()
@ApiTags('Batch')
export class BatchController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('notification')
  getNotificationBatchLog(@Query() query: PagingDto) {
    return this.messageBuilder.sendMessage(EService.CRON, query, {
      cmd: BatchController.prototype.getNotificationBatchLog.name,
    });
  }

  @Put('notification/config')
  updateNotificationBatchConfig(@Body() body: BatchConfigDto) {
    return this.messageBuilder.sendMessage(EService.CRON, body, {
      cmd: BatchController.prototype.updateNotificationBatchConfig.name,
    });
  }

  @Get('user')
  getUserBatchLog(@Query() query: PagingDto) {
    return this.messageBuilder.sendMessage(EService.CRON, query, {
      cmd: BatchController.prototype.getUserBatchLog.name,
    });
  }

  @Put('user/config')
  updateUserBatchConfig(@Body() body: BatchConfigDto) {
    return this.messageBuilder.sendMessage(EService.CRON, body, {
      cmd: BatchController.prototype.updateUserBatchConfig.name,
    });
  }
}
