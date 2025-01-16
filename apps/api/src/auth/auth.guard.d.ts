import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../token/token.service';
export declare class AuthGuard implements CanActivate {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
