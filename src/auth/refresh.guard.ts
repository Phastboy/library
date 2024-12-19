import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService, private usersService: UsersService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokenService.extractTokenFromCookie(request.headers?.cookie, 'refreshToken');
    if (!token) {
      throw new Error('No token found in request headers');
    }

    try {
      const validUser = await this.tokenService.verify(token, RefreshGuard);
      Logger.log(`Valid user: ${JSON.stringify(validUser)}`, RefreshGuard.name);
      // find user in database and compare refresh token with argon2 hash
      const user = await this.usersService.find(RefreshGuard, { id: validUser.userId });
        if (!user) {
            throw new Error('User not found');
        }
        const validRefreshToken = await argon2.verify(user.refreshToken, token);
        if (!validRefreshToken) {
            throw new Error('Invalid refresh token');
        }
      request.userId = user.id;
      Logger.log(`userId: ${user.id}`, RefreshGuard.name);
    } catch (error) {
      Logger.error('Invalid token', RefreshGuard.name);
      throw new Error('Invalid token');
    }
    
    return true;
  }
}
