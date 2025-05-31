import { Module } from '@nestjs/common';
import { RequestAbsenceService } from './request-absence.service';
import { RequestAbsenceController } from './request-absence.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [RequestAbsenceController],
  providers: [RequestAbsenceService],
  exports: [RequestAbsenceService],
})
export class RequestAbsenceModule {}
