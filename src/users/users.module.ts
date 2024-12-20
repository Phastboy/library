import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { AddressesModule } from './addresses/addresses.module';
import { TokenService } from 'src/token/token.service';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule, AddressesModule, TokenModule, MailModule],
  providers: [UsersService, TokenService, MailService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
