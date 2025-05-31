import { configuration } from '@lib/core/configs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { MarketingModule } from './marketing/marketing.module';
import { DatabaseModule } from '@lib/core/databases';
import { dbConfig } from '@lib/common/constants';
import { FcmModule } from './fcm/fcm.module';
import { GeneralModule } from './general/general.module';
import { ChatModule } from './chat/chat.module';

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
    MailModule,
    MarketingModule,
    FcmModule,
    GeneralModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
