import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { MailModule } from './mail/mail.module';
import { BooksModule } from './books/books.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        PrismaModule,
        UsersModule,
        ProfileModule,
        MailModule,
        BooksModule,
        RateLimiterModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
