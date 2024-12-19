import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';

@Module({
  imports: [UsersModule, PrismaModule, TokenModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    UsersService,
    PrismaService,
    TokenService
  ],
})
export class ProfileModule {}
