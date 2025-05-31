import { Module } from '@nestjs/common';
import { ConversationModule } from './conversation/conversation.module';
import { dbConfig } from '@lib/common/constants';
import { configuration } from '@lib/core/configs';
import { DatabaseModule } from '@lib/core/databases';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageModule } from './message/message.module';

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
    ConversationModule,
    MessageModule,
  ],
})
export class AppModule {}
