import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { RequestContactModule } from '../request-contact/request-contact.module';
import { RequestQuestionModule } from '../request-question/request-question.module';
import { RequestReportModule } from '../request-report/request-report.module';
import { RequestAbsenceModule } from '../request-absence/request-absence.module';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [
    ...mapEntities(entities),
    RequestContactModule,
    RequestQuestionModule,
    RequestReportModule,
    RequestAbsenceModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
