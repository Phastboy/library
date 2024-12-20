import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokenService.extractTokenFromCookie(
      request.headers?.cookie,
      'accessToken',
    );
    if (!token) throw new UnauthorizedException('Access token not found');

    const user = await this.tokenService.verify(token);
    request.userId = user;
    return true;
  }
}
