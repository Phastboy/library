import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payload, Tokens, User } from 'src/types';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

    secret = (className: any) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          Logger.error('JWT secret is not set!', className.name);
          if(!this.isProduction()) {
            Logger.warn('Using default secret', className.name)
            return 'default-secret';
          }
          throw new InternalServerErrorException('JWT secret is not set');
        }
        return secret;
    }

    async generate(payload: User, className: any, expiresIn: string): Promise<string> {
        const secret = this.secret(className);
        return this.jwtService.sign(payload, { secret, expiresIn });
    }

    async authTokens(userId: string, className: any): Promise<Tokens> {
        const secret = this.secret(className);
        const accessToken = this.jwtService.sign({userId}, { secret, expiresIn: '24h' });
        const refreshToken = this.jwtService.sign({userId}, { secret, expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    async verify(token: string, className: any): Promise<Payload> {
        const secret = this.secret(className);
        try {
            const data = this.jwtService.verify(token, { secret });
            Logger.log(data, TokenService.name);
            return data;
        } catch (error) {
            Logger.log('Invalid token', TokenService.name);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
