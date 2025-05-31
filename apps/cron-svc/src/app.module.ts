import { Module } from '@nestjs/common';
import { CronSvcService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from '@lib/core/configs';
import { DatabaseModule } from '@lib/core/databases';
import { dbConfig } from '@lib/common/constants';
import { BatchModule } from './batch/batch.module';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { BookingModule } from './booking/booking.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    BatchModule,
    MessageBuilderModule,
    BookingModule,
    UserModule,
  ],
  providers: [CronSvcService],
})
export class AppModule {}
