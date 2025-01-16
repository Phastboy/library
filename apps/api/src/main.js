"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const os = require("os");
const port = process.env.PORT || 3001;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Library API')
        .setDescription('Documentation for the Library API')
        .setVersion('0.0.1')
        .addTag('library')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('/docs', app, document, {
        swaggerOptions: {
            requestInterceptor: (req) => {
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
        common_1.Logger.log(`app is listening at ${protocol}://${address}:${port}`, 'app');
    });
}
bootstrap();
//# sourceMappingURL=main.js.map