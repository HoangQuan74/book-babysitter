import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}