"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let TokenService = TokenService_1 = class TokenService {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '24h';
        this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        this.TokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30m';
    }
    isProduction() {
        return process.env.NODE_ENV === 'production';
    }
    getSecret() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            common_1.Logger.error('JWT_SECRET is not set', TokenService_1.name);
            throw new common_1.InternalServerErrorException('JWT_SECRET is not set');
        }
        return secret;
    }
    async generate(userId) {
        const secret = this.getSecret();
        return this.jwtService.sign({ userId }, {
            secret,
            expiresIn: this.TokenExpiresIn,
        });
    }
    async authTokens(userId) {
        const secret = this.getSecret();
        const accessToken = this.jwtService.sign({ userId }, { secret, expiresIn: this.accessTokenExpiresIn });
        const refreshToken = this.jwtService.sign({ userId }, { secret, expiresIn: this.refreshTokenExpiresIn });
        return { accessToken, refreshToken };
    }
    async verify(token) {
        const secret = this.getSecret();
        try {
            return this.jwtService.verify(token, { secret }).userId;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Malformed token');
            }
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromCookie(cookie, tokenKey) {
        if (!cookie)
            return null;
        const token = cookie
            .split(';')
            .find((c) => c.trim().startsWith(`${tokenKey}=`));
        return token ? token.split('=')[1] : null;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TokenService);
//# sourceMappingURL=token.service.js.map