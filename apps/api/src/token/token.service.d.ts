import { JwtService } from '@nestjs/jwt';
import { Tokens } from 'src/types';
export declare class TokenService {
    private jwtService;
    constructor(jwtService: JwtService);
    private readonly accessTokenExpiresIn;
    private readonly refreshTokenExpiresIn;
    private readonly TokenExpiresIn;
    isProduction(): boolean;
    private getSecret;
    generate(userId: string): Promise<string>;
    authTokens(userId: string): Promise<Tokens>;
    verify(token: string): Promise<string>;
    extractTokenFromCookie(cookie: string | undefined, tokenKey: string): string | null;
}
