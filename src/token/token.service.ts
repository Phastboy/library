import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/types';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

    secret = (className: any) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          Logger.error('JWT secret is not set!', className.name);
          if(process.env.NODE_ENV !== 'production') {
            Logger.warn('Using default secret', className.name)
            return 'default-secret';
          }
          throw new InternalServerErrorException('JWT secret is not set');
        }
        return secret;
    }

    async verify(token: string, secret: string): Promise<Payload> {
        try {
            return this.jwtService.verify(token, { secret });
        } catch (error) {
            Logger.log('Invalid token', TokenService.name);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
