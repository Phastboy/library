import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as os from 'os';

const port = process.env.PORT || 3003;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('Library API')
        .setDescription('Documentation for the Library API')
        .setVersion('0.0.1')
        .addTag('library')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document, {
        swaggerOptions: {
            requestInterceptor: (req: any) => {
                req.credentials = 'include';
                return req;
            },
        },
    });

    await app.listen(port);

    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                addresses.push(alias.address);
            }
        }
    }

    const protocol = app.getHttpAdapter().getInstance().server?.proto || 'http';

    addresses.forEach((address) => {
        Logger.log(
            `app is listening at ${protocol}://${address}:${port}`,
            'app',
        );
    });
}
bootstrap();
