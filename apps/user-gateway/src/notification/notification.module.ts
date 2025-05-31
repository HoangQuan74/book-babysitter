import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
