import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { AuthenticatedRequest } from 'src/types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const token = this.tokenService.extractTokenFromCookie(
      request.headers?.cookie,
      'refreshToken',
    );
    if (!token) throw new UnauthorizedException('Refresh token not found');

    const user = await this.usersService.validateRefreshToken(token);
    request.userId = user;
    return true;
  }
}