import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService } from '@lib/common/enums';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LanguageCode, Public, RequestUser } from '@lib/common/decorator';
import {
  AlarmNotificationDto,
  CreateEmailTemplateDto,
  GeneralNotificationDto,
  NotificationDto,
  NotificationPushDto,
  PushNotificationDto,
  QueryAlarmNotificationDto,
  QueryGeneralNotificationDto,
  SendEmailDto,
} from './dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { PagingDto } from '@lib/common/dto';
import { query } from 'express';

@Controller('notification')
@ApiBearerAuth()
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('list')
  getListNotification(@Query() query: QueryNotificationDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, query, {
      cmd: NotificationController.prototype.getListNotification.name,
    });
  }

  @Get('/detail/:id')
  getNotificationDetail(@Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { id },
      {
        cmd: NotificationController.prototype.getNotificationDetail.name,
      },
    );
  }

  @Post('/cancel/:id')
  cancelSendNotification() {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      {},
      { cmd: NotificationController.prototype.getNotificationDetail.name },
    );
  }

  @Post('push')
  createPushNotification(@Body() body: NotificationPushDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.createPushNotification.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('push/type')
  getPushType(@LanguageCode() languageCode: string) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { languageCode },
      { cmd: NotificationController.prototype.getPushType.name },
    );
  }

  @Get('alarm')
  getAlarmNotification(@Query() query: QueryAlarmNotificationDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, query, {
      cmd: NotificationController.prototype.getAlarmNotification.name,
    });
  }

  @Put('alarm/:id')
  updateAlarmNotification(
    @Body() body: AlarmNotificationDto,
    @Param('id') id: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { id, body },
      {
        cmd: NotificationController.prototype.updateAlarmNotification.name,
      },
    );
  }

  @Post('email')
  createEmailMarketing(@Body() body: NotificationDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.createEmailMarketing.name,
    });
  }

  @Post('email/send')
  sendEmail(@Body() body: SendEmailDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.sendEmail.name,
    });
  }

  @Post('/email/template')
  createEmailTemplate(
    @RequestUser() user,
    @Body() body: CreateEmailTemplateDto,
  ) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.createEmailTemplate.name,
    });
  }

  @Get('/email/template')
  getEmailTemplate() {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      {},
      {
        cmd: NotificationController.prototype.getEmailTemplate.name,
      },
    );
  }

  @Get('/email/template/:name')
  getEmailTemplateDetail(@Param('name') templateName: string) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { templateName },
      {
        cmd: NotificationController.prototype.getEmailTemplateDetail.name,
      },
    );
  }

  @Put('/email/template')
  updateEmailTemplate(@Body() body: CreateEmailTemplateDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.updateEmailTemplate.name,
    });
  }

  @Public()
  @Post('apn')
  pushAppNotification(@Body() body: PushNotificationDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, body, {
      cmd: NotificationController.prototype.pushAppNotification.name,
    });
  }

  @Post('general')
  createGeneralNotification(
    @RequestUser() user,
    @Body() body: GeneralNotificationDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { user, body },
      {
        cmd: NotificationController.prototype.createGeneralNotification.name,
      },
    );
  }

  @Get('general')
  getGeneralNotification(@Query() query: QueryGeneralNotificationDto) {
    return this.messageBuilder.sendMessage(EService.NOTIFY, query, {
      cmd: NotificationController.prototype.getGeneralNotification.name,
    });
  }

  @Get('general/:id')
  getGeneralNotificationDetail(@Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { id },
      {
        cmd: NotificationController.prototype.getGeneralNotificationDetail.name,
      },
    );
  }

  @Put('general/:id')
  updateGeneralNotificationDetail(
    @Param('id') id: string,
    @Body() body: GeneralNotificationDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { id, body },
      {
        cmd: NotificationController.prototype.updateGeneralNotificationDetail
          .name,
      },
    );
  }
}
