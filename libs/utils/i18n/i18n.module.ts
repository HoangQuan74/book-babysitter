import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: path.join(process.cwd(), 'libs/utils/i18n'),
          watch: true,
        },
      }),
      resolvers: [new HeaderResolver(['X-LANG-CODE']), AcceptLanguageResolver],
      inject: [ConfigService],
    }),
  ],
})
export class I18nConfigModule {}
