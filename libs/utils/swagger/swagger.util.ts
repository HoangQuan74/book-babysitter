import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(
  app: INestApplication,
  title: string,
  description: string,
  version: string,
) {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'X-APP-NAME', in: 'header' },
      'X-APP-NAME',
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-LANG-CODE', in: 'header' },
      'X-LANG-CODE',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, document);
}
