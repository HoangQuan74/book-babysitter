import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
