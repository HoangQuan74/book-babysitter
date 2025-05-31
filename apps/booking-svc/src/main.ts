import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EService } from '@lib/common/enums';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const appName = EService.BOOKING;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get(appName);

  app.init();
  app.connectMicroservice<MicroserviceOptions>(config);
  app.startAllMicroservices();
}
bootstrap();
