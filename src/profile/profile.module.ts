import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [UsersModule, PrismaModule, TokenModule, AuthModule, MailModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    UsersService,
    PrismaService,
    TokenService,
    AuthService,
    MailService,
  ],
})
export class ProfileModule {}
