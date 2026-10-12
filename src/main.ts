import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Live Sports Score API')
    .setDescription(
      'A real-time sports score tracking API with WebSocket support for live score updates.',
    )
    .setVersion('1.0')
    .addTag('Matches', 'Match management endpoints')
    .addTag('Scores', 'Score management and live updates')
    .addTag('Events', 'Match event endpoints')
    .addTag('Teams', 'Team management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  logger.log(`🔌 WebSocket endpoint at ws://localhost:${port}/scores`);
}

bootstrap();
