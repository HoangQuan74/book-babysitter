import { LanguageCode } from '@lib/common/decorator';
import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @ApiSecurity('X-LANG-CODE')
  @Get('')
  async getResources(@LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(EService.AUTH, lang, {
      cmd: ResourceController.prototype.getResources.name,
    });
  }
}
