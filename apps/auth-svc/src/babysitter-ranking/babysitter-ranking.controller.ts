import { Controller } from '@nestjs/common';
import { BabysitterRankingService } from './babysitter-ranking.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';
import { ELanguage } from '@lib/common/enums';
import { ERankingType } from '@lib/core/databases/postgres/entities';

@Controller('babysitter-ranking')
export class BabysitterRankingController {
  constructor(
    private readonly babysitterRankingService: BabysitterRankingService,
  ) {}

  @MessagePattern({
    cmd: BabysitterRankingController.prototype.getBabysitterRanking.name,
  })
  async getBabysitterRanking(payload: {
    reqUser: IRequestUser;
    lang: ELanguage;
    type: ERankingType;
  }) {
    const { reqUser, lang, type } = payload;
    return this.babysitterRankingService.getBabysitterRanking(
      reqUser,
      lang,
      type,
    );
  }

  @MessagePattern({
    cmd: BabysitterRankingController.prototype.saveBabysitterRanking.name,
  })
  async saveBabysitterRanking(payload: {
    babysitterIds: string[];
    type: ERankingType;
  }) {
    const { babysitterIds, type } = payload;
    return this.babysitterRankingService.saveBabysitterRanking(
      babysitterIds,
      type,
    );
  }
}
