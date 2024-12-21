import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens, User } from 'src/types';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  private readonly accessTokenExpiresIn =
    process.env.ACCESS_TOKEN_EXPIRES_IN || '24h';
  private readonly refreshTokenExpiresIn =
    process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  private readonly TokenExpiresIn =
    process.env.REFRESH_TOKEN_EXPIRES_IN || '30m';
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  private getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      Logger.error('JWT_SECRET is not set', TokenService.name);
      throw new InternalServerErrorException('JWT_SECRET is not set');
    }
    return secret;
  }

  async generate(id: string): Promise<string> {
    const secret = this.getSecret();
    return this.jwtService.sign(
      { id },
      {
        secret,
        expiresIn: this.TokenExpiresIn,
      },
    );
  }

  async authTokens(userId: string): Promise<Tokens> {
    const secret = this.getSecret();
    const accessToken = this.jwtService.sign(
      { userId },
      { secret, expiresIn: this.accessTokenExpiresIn },
    );
    const refreshToken = this.jwtService.sign(
      { userId },
      { secret, expiresIn: this.refreshTokenExpiresIn },
    );
    return { accessToken, refreshToken };
  }

  async verify(token: string): Promise<string> {
    const secret = this.getSecret();
    try {
      return this.jwtService.verify(token, { secret }).userId;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Malformed token');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  extractTokenFromCookie(
    cookie: string | undefined,
    tokenKey: string,
  ): string | null {
    if (!cookie) return null;
    const token = cookie
      .split(';')
      .find((c) => c.trim().startsWith(`${tokenKey}=`));
    return token ? token.split('=')[1] : null;
  }
}
