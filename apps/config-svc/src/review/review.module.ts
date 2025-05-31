import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
