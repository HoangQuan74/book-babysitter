import { Controller, Get } from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService } from '@lib/common/enums';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@lib/common/decorator';

@Controller('term-type')
@ApiTags('Config')
export class TermTypeController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Public()
  @Get('/')
  async getTermTypes() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      { cmd: TermTypeController.prototype.getTermTypes.name },
    );
  }
}
