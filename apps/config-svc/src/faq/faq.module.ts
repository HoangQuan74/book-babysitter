import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
