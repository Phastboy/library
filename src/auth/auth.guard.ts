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
    const token = this.tokenService.extractTokenFromCookie(request.headers?.cookie, 'accessToken')
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
}
