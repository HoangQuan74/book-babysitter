import { ELanguage, EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  QueryStatisticsBabysitterList,
  QueryStatisticsBabysitterRegion,
  QueryStatisticsCommonDto,
} from './dto';
import { LanguageCode } from '@lib/common/decorator';

@ApiBearerAuth()
@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('common')
  async getStatisticsCommon(
    @Query() query: QueryStatisticsCommonDto,
    @LanguageCode() lang: ELanguage,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { query, lang },
      {
        cmd: StatisticsController.prototype.getStatisticsCommon.name,
      },
    );
  }

  @Get('babysitter')
  async getStatisticsBabysitter() {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      {},
      {
        cmd: StatisticsController.prototype.getStatisticsBabysitter.name,
      },
    );
  }

  @Post('babysitter/region')
  async getStatisticsBabysitterRegion(
    @Body() { cityIds }: QueryStatisticsBabysitterRegion,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { cityIds },
      {
        cmd: StatisticsController.prototype.getStatisticsBabysitterRegion.name,
      },
    );
  }

  @Get('babysitter/list')
  async getStatisticsBabysitterList(
    @Query() { type }: QueryStatisticsBabysitterList,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { type },
      {
        cmd: StatisticsController.prototype.getStatisticsBabysitterList.name,
      },
    );
  }

  @Get('parent')
  async getStatisticsParent() {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      {},
      {
        cmd: StatisticsController.prototype.getStatisticsParent.name,
      },
    );
  }
}
