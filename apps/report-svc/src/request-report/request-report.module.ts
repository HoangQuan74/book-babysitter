import { Module } from '@nestjs/common';
import { RequestReportService } from './request-report.service';
import { RequestReportController } from './request-report.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [RequestReportController],
  providers: [RequestReportService],
  exports: [RequestReportService],
})
export class RequestReportModule {}
