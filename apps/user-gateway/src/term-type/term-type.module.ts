import { Module } from '@nestjs/common';
import { TermTypeService } from './term-type.service';
import { TermTypeController } from './term-type.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [TermTypeController],
  providers: [TermTypeService],
})
export class TermTypeModule {}
