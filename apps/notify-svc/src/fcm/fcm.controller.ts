import { Controller } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @MessagePattern({
    cmd: FcmController.prototype.pushAppNotification.name,
  })
  pushAppNotification(data) {
    return this.fcmService.pushAppNotification(data);
  }
}
