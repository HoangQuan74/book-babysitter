import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EGateway } from '@lib/common/enums';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const context = EGateway.SOCKET;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get(context);
  await app.listen(config.port);
}
bootstrap();
