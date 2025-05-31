import { Controller } from '@nestjs/common';
import { NotificationBackgroundService } from './notification-background.service';
import { MessagePattern } from '@nestjs/microservices';
import { ENotificationBackgroundType } from '@lib/core/databases/postgres/entities/notification-background.entity';
import { INotificationBackground } from '@lib/common/interfaces';

@Controller('notification-background')
export class NotificationBackgroundController {
  constructor(
    private readonly notificationBackgroundService: NotificationBackgroundService,
  ) {}

  @MessagePattern({
    cmd: NotificationBackgroundController.prototype.getNotificationBackground
      .name,
  })
  async getNotificationBackground(payload: {
    type: ENotificationBackgroundType;
  }) {
    const { type } = payload;
    return await this.notificationBackgroundService.getNotificationBackground(
      type,
    );
  }

  @MessagePattern({
    cmd: NotificationBackgroundController.prototype.createNotificationBackground
      .name,
  })
  async createNotificationBackground(payload: {
    data: INotificationBackground;
  }) {
    const { data } = payload;
    return await this.notificationBackgroundService.createNotificationBackground(
      data,
    );
  }
}
