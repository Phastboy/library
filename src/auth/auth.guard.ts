import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request);
    if (!token) {
      throw new Error('No token found in request headers');
    }

    try {
      const user = await this.tokenService.verify(token, AuthGuard)
      request.userId = user.userId
      Logger.log(user, AuthGuard.name);
    } catch (error) {
      Logger.error('Invalid token', AuthGuard.name);
      throw new Error('Invalid token');
    }
    
    return true;
  }

  private extractTokenFromHeaders(request: Request): string | null {
    // extract cookie from request headers
    const cookie = request.headers?.cookie;
    if (!cookie) {
      Logger.error('No cookie found in request headers', AuthGuard.name);
      return null;
    }

    // extract tokens from cookie
    const token = cookie.split(';').find(c => c.trim().startsWith('accessToken='));
    if (token) {
      Logger.log(`Token: ${token}`, AuthGuard.name);
      const accessToken = token.split('=')[1];
      Logger.log(`Access token: ${accessToken}`, AuthGuard.name);
      return accessToken;
    }
    Logger.error('No access token found in cookie', AuthGuard.name);
    return null;
  }
}
