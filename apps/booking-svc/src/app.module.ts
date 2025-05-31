import { dbConfig } from '@lib/common/constants';
import { configuration } from '@lib/core/configs';
import { DatabaseModule } from '@lib/core/databases';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';
import { RatingCommentModule } from './rating-comment/rating-comment.module';
import { RatingUserModule } from './rating-user/rating-user.module';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { NotificationModule } from './notification/notification.module';

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
    MessageBuilderModule,
    BookingModule,
    RatingCommentModule,
    RatingUserModule,
    NotificationModule,
  ],
})
export class AppModule {}
