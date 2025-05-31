import { Module } from '@nestjs/common';
import { BabysitterRankingService } from './babysitter-ranking.service';
import { BabysitterRankingController } from './babysitter-ranking.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [BabysitterRankingController],
  providers: [BabysitterRankingService],
})
export class BabysitterRankingModule {}
