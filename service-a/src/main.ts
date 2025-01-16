import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL],
    },
  });
  await app.startAllMicroservices();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Service A APIs')
    .setDescription(
      'APIs for Service A including public API integrations and MongoDB queries',
    )
    .setVersion('1.0')
    .addTag('public-api') // Tag for grouping related APIs
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
