
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from 'src/dto/auth/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        })
    }

    async validate(email: string, password: string, className: any): Promise<any> {
        try {
            Logger.log(`Received request to validate user with email ${email}`, className.name);
            const user = await this.authService.validateUser(email, password);
            if (!user) {
                Logger.error(`User with email ${email} not found`, className.name);
                throw new UnauthorizedException();
            }
            Logger.log(`User with email ${email} validated successfully`, className.name);
            return user;
        } catch (error) {
            throw error;
        } finally {
            Logger.log(`done validating user with email ${email}`, className.name);
        }
    }
}
