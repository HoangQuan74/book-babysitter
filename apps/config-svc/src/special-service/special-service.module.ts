import { Module } from '@nestjs/common';
import { SpecialServiceService } from './special-service.service';
import { SpecialServiceController } from './special-service.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [SpecialServiceController],
  providers: [SpecialServiceService],
})
export class SpecialServiceModule {}
