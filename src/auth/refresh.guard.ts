import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
