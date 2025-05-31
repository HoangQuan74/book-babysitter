import { Controller } from '@nestjs/common';
import { GeneralService } from './general.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}
  @MessagePattern({
    cmd: GeneralController.prototype.getGeneralNotification.name,
  })
  getGeneralNotification(data) {
    return this.generalService.getGeneralNotification(data);
  }

  @MessagePattern({
    cmd: GeneralController.prototype.getGeneralNotificationDetail.name,
  })
  getGeneralNotificationDetail(data) {
    return this.generalService.getGeneralNotificationDetail(data);
  }

  @MessagePattern({
    cmd: GeneralController.prototype.createGeneralNotification.name,
  })
  createGeneralNotification(data) {
    return this.generalService.createGeneralNotification(data);
  }
}
