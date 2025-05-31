import { Controller } from '@nestjs/common';
import { BatchService } from './batch.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @MessagePattern({
    cmd: BatchController.prototype.getNotificationBatchLog.name,
  })
  getNotificationBatchLog(data) {
    return this.batchService.getNotificationBatchLog(data);
  }

  @MessagePattern({
    cmd: BatchController.prototype.updateNotificationBatchConfig.name,
  })
  updateNotificationBatchConfig(data) {
    return this.batchService.updateNotificationBatchConfig(data);
  }

  @MessagePattern({
    cmd: BatchController.prototype.getUserBatchLog.name,
  })
  getUserBatchLog(data) {
    return this.batchService.getUserBatchLog(data);
  }

  @MessagePattern({
    cmd: BatchController.prototype.updateUserBatchConfig.name,
  })
  updateUserBatchConfig(data) {
    // return this.batchService.updateUserBatchConfig(data);
  }
}
