import { Module } from '@nestjs/common';
import { RatingCommentService } from './rating-comment.service';
import { RatingCommentController } from './rating-comment.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [RatingCommentController],
  providers: [RatingCommentService],
})
export class RatingCommentModule {}
