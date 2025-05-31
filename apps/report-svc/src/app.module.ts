import { dbConfig } from '@lib/common/constants';
import { configuration } from '@lib/core/configs';
import { DatabaseModule } from '@lib/core/databases';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestModule } from './request/request.module';
import { RequestReportModule } from './request-report/request-report.module';
import { RequestQuestionModule } from './request-question/request-question.module';
import { RequestContactModule } from './request-contact/request-contact.module';
import { StatisticsModule } from './statistics/statistics.module';
import { RequestAbsenceModule } from './request-absence/request-absence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ...DatabaseModule.register({
      dbConfig,
      getConfig: (cf) => (configService: ConfigService) => {
        const schemaDbConfig = configService.get(cf);
        return Object.assign(
          {},
          schemaDbConfig,
          schemaDbConfig?.replication?.master,
        );
      },
    }),
    RequestModule,
    RequestReportModule,
    RequestQuestionModule,
    RequestContactModule,
    StatisticsModule,
    RequestAbsenceModule,
  ],
})
export class AppModule {}
