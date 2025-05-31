import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EService } from '@lib/common/enums';
import { TransformInterceptor } from '@lib/utils/interceptors';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const appName = EService.POST;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get(appName);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.init();
  app.connectMicroservice<MicroserviceOptions>(config);
  app.startAllMicroservices();
}
bootstrap();
