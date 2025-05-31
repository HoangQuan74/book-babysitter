import { Module } from '@nestjs/common';
import { TermPolicyModule } from './term-policy/term-policy.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, dataSourceOptions } from '@lib/core/configs';
import { DatabaseModule } from '@lib/core/databases';
import { dbConfig } from '@lib/common/constants';
import { LanguageModule } from './language/language.module';
import { TermTypeModule } from './term-type/term-type.module';
import { IntroductionImageModule } from './introduction-image/introduction-image.module';
import { CountryModule } from './country/country.module';
import { SpecialServiceModule } from './special-service/special-service.module';
import { UserImageModule } from './user-image/user-image.module';
import { MetaDataModule } from './meta-data/meta-data.module';
import { FaqModule } from './faq/faq.module';
import { ReviewModule } from './review/review.module';
import { ConversationCheckListModule } from './conversation-check-list/conversation-check-list.module';
import { NotificationBackgroundModule } from './notification-background/notification-background.module';
import { IntroductionBannerModule } from './introduction-banner/introduction-banner.module';

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
    TermPolicyModule,
    LanguageModule,
    TermTypeModule,
    IntroductionImageModule,
    CountryModule,
    SpecialServiceModule,
    UserImageModule,
    MetaDataModule,
    FaqModule,
    ReviewModule,
    ConversationCheckListModule,
    NotificationBackgroundModule,
    IntroductionBannerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
