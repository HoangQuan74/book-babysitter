import { Module } from '@nestjs/common';
import { RequestQuestionService } from './request-question.service';
import { RequestQuestionController } from './request-question.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [RequestQuestionController],
  providers: [RequestQuestionService],
  exports: [RequestQuestionService],
})
export class RequestQuestionModule {}
