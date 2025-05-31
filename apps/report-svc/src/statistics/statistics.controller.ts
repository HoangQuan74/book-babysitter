import { Controller } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { MessagePattern } from '@nestjs/microservices';
import { ELanguage, EStatisticsBabysitterList } from '@lib/common/enums';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @MessagePattern({
    cmd: StatisticsController.prototype.getStatisticsCommon.name,
  })
  async getStatisticsCommon(payload: { query: any; lang: ELanguage }) {
    const { query, lang } = payload;
    return this.statisticsService.getStatisticsCommon(query, lang);
  }

  @MessagePattern({
    cmd: StatisticsController.prototype.getStatisticsBabysitter.name,
  })
  async getStatisticsBabysitter() {
    return this.statisticsService.getStatisticsBabysitter();
  }

  @MessagePattern({
    cmd: StatisticsController.prototype.getStatisticsBabysitterRegion.name,
  })
  async getStatisticsBabysitterRegion(payload: { cityIds: string[] }) {
    const { cityIds } = payload;
    return this.statisticsService.getStatisticsBabysitterRegion(cityIds);
  }

  @MessagePattern({
    cmd: StatisticsController.prototype.getStatisticsBabysitterList.name,
  })
  async getStatisticsBabysitterList(payload: {
    type: EStatisticsBabysitterList;
  }) {
    const { type } = payload;
    return this.statisticsService.getStatisticsBabysitterList(type);
  }

  @MessagePattern({
    cmd: StatisticsController.prototype.getStatisticsParent.name,
  })
  async getStatisticsParent() {
    return this.statisticsService.getStatisticsParent();
  }
}
