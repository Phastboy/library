import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestPayload, ResponsePayload } from 'src/types';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

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

    async generate(payload: RequestPayload, className: any, expiresIn: string): Promise<string> {
        const secret = this.secret(className);
        return this.jwtService.sign(payload, { secret, expiresIn });
    }

    async verify(token: string, className: any): Promise<ResponsePayload> {
        const secret = this.secret(className);
        try {
            return this.jwtService.verify(token, { secret });
        } catch (error) {
            Logger.log('Invalid token', TokenService.name);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
