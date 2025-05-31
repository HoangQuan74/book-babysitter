import { Module } from '@nestjs/common';
import { TermTypeService } from './term-type.service';
import { TermTypeController } from './term-type.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [TermTypeController],
  providers: [TermTypeService],
})
export class TermTypeModule {}
