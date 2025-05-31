import { Controller } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @MessagePattern({
    cmd: MarketingController.prototype.createEmailMarketing.name,
  })
  createEmailMarketing(data) {
    return this.marketingService.createEmailMarketing(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.getAlarmNotification.name,
  })
  getAlarmNotification(data) {
    return this.marketingService.getAlarmNotification(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.updateAlarmNotification.name,
  })
  updateAlarmNotification(data) {
    return this.marketingService.updateAlarmNotification(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.getPushType.name,
  })
  getPushType(data) {
    return this.marketingService.getPushType(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.createPushNotification.name,
  })
  createPushNotification(data) {
    return this.marketingService.createPushNotification(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.getListNotification.name,
  })
  getListNotification(data) {
    return this.marketingService.getListNotification(data);
  }

  @MessagePattern({
    cmd: MarketingController.prototype.getNotificationDetail.name,
  })
  getNotificationDetail(data) {
    return this.marketingService.getNotificationDetail(data);
  }
}
