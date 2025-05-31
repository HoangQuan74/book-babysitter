import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [SupportController],
})
export class SupportModule {}
