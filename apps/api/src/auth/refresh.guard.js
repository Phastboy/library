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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshGuard = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("../token/token.service");
const users_service_1 = require("../users/users.service");
let RefreshGuard = class RefreshGuard {
    constructor(tokenService, usersService) {
        this.tokenService = tokenService;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.tokenService.extractTokenFromCookie(request.headers?.cookie, 'refreshToken');
        if (!token)
            throw new common_1.UnauthorizedException('Refresh token not found');
        const user = await this.usersService.validateRefreshToken(token);
        request.userId = user;
        return true;
    }
};
exports.RefreshGuard = RefreshGuard;
exports.RefreshGuard = RefreshGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        users_service_1.UsersService])
], RefreshGuard);
//# sourceMappingURL=refresh.guard.js.map