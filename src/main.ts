import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './response/response.interceptor';

const port = process.env.PORT || 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor())

  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('Documentation for the Library API')
    .setVersion('0.0.1')
    .addTag('library')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(port);
  Logger.log(`app is listening at ${port}`, 'app');
}
bootstrap();
