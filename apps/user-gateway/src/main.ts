import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from '@lib/utils/swagger';
import { TransformInterceptor } from '@lib/utils/interceptors';
import { EGateway } from '@lib/common/enums';
import { ConfigService } from '@nestjs/config';
import { errorFormatter } from '@lib/utils';
import { GatewayExceptionFilter } from '@lib/utils/exception-filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { JwtGuard } from '@lib/utils/guards';
import { MessageBuilder } from '@lib/core/message-builder';

async function bootstrap() {
  const context = EGateway.USER;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get(context);

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  setupSwagger(
    app,
    'Microservices API',
    'API documentation for user service',
    '1.0.0',
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errorFormatter(errors);
        return new BadRequestException([message]);
      },
    }),
  );

  const reflector = new Reflector();
  const messageBuilder = new MessageBuilder(configService);
  app.useGlobalGuards(new JwtGuard(messageBuilder, reflector));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GatewayExceptionFilter());

  await app.listen(config.port);
}
bootstrap();
