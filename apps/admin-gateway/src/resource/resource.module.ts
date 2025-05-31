import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [ResourceController],
})
export class ResourceModule {}
