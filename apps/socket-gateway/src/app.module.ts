import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@lib/core/configs';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { I18nConfigModule } from './i18n';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    I18nConfigModule,
    MessageBuilderModule,
    AwsClientModule,
  ],
  providers: [AppController, AppService],
})
export class AppModule {}
