import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';
export declare class RefreshGuard implements CanActivate {
    private readonly tokenService;
    private usersService;
    constructor(tokenService: TokenService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
