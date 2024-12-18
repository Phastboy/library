import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
    }),
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
