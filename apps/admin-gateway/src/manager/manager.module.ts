import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [ManagerController],
})
export class ManagerModule {}
