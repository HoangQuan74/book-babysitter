import { configuration } from '@lib/core/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule as ConfigsModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ManagerModule } from './manager/manager.module';
import { ResourceModule } from './resource/resource.module';
import { PostModule } from './post/post.module';
import { ConversationModule } from './conversation/conversation.module';
import { SupportModule } from './support/support.module';
import { BookingModule } from './booking/booking.module';
import { I18nConfigModule } from './i18n';
import { StatisticsModule } from './statistics/statistics.module';
import { BatchModule } from './batch/batch.module';
import { SocketClientModule } from './socket-client/socket-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    I18nConfigModule,
    AuthModule,
    ConfigsModule,
    NotificationModule,
    UserModule,
    ManagerModule,
    ResourceModule,
    PostModule,
    ConversationModule,
    SupportModule,
    BookingModule,
    StatisticsModule,
    BatchModule,
    SocketClientModule,
  ],
})
export class AppModule {}
