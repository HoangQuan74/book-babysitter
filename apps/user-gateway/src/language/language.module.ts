import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { MessageBuilderModule } from '@lib/core/message-builder/message-builder.module';

@Module({
  imports: [MessageBuilderModule],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class LanguageModule {}
