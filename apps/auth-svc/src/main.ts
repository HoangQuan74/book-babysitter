import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EService } from '@lib/common/enums';
import { TransformInterceptor } from '@lib/utils/interceptors';

async function bootstrap() {
  const appName = EService.AUTH;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get(appName);

  app.useGlobalInterceptors(new TransformInterceptor());

  app.init();
  app.connectMicroservice<MicroserviceOptions>(config);
  app.startAllMicroservices();
}
bootstrap();
