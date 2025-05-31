import { configuration } from '@lib/core/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as ConfigsModule } from './config/config.module';
import { LanguageModule } from './language/language.module';
import { TermTypeModule } from './term-type/term-type.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { SupportModule } from './support/support.module';
import { PostModule } from './post/post.module';
import { BookingModule } from './booking/booking.module';
import { CommentModule } from './comment/comment.module';
import { I18nConfigModule } from './i18n';
import { NotificationModule } from './notification/notification.module';
import { SocketClientModule } from './socket-client/socket-client.module';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    I18nConfigModule,
    ConfigsModule,
    LanguageModule,
    TermTypeModule,
    AuthModule,
    UserModule,
    ConversationModule,
    SupportModule,
    PostModule,
    BookingModule,
    CommentModule,
    NotificationModule,
    SocketClientModule,
    RatingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
