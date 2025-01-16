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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const argon2 = require("argon2");
const token_service_1 = require("../token/token.service");
const mail_service_1 = require("../mail/mail.service");
const link_util_1 = require("../utils/link.util");
let AuthService = AuthService_1 = class AuthService {
    constructor(userService, tokenService, mailService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.mailService = mailService;
        this.cookieOptions = {
            httpOnly: true,
            secure: this.tokenService.isProduction(),
            sameSite: this.tokenService.isProduction() ? 'none' : 'lax',
            path: '/',
        };
    }
    async create(createUserDto) {
        common_1.Logger.log('registering user...', AuthService_1.name);
        return await this.userService.create(createUserDto);
    }
    async login(data) {
        common_1.Logger.log('Received request to login', AuthService_1.name);
        try {
            const user = await this.userService.find(AuthService_1, {
                email: data.email,
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid email');
            }
            const isPasswordValid = await argon2.verify(user.password, data.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
            const { accessToken, refreshToken } = await this.tokenService.authTokens(user.id);
            const hashedRefreshToken = await argon2.hash(refreshToken);
            await this.userService.update(user.id, {
                refreshToken: hashedRefreshToken,
            });
            common_1.Logger.log(`Login successful for user with email ${data.email}`, AuthService_1.name);
            return { accessToken, refreshToken };
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthService_1.name);
            throw error;
        }
    }
    async verifyEmail(token) {
        common_1.Logger.log('Received request to verify email', AuthService_1.name);
        try {
            const data = await this.userService.verifyEmail(token);
            if (data) {
                return data;
            }
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthService_1.name);
            throw error;
        }
    }
    async refreshTokens(userId) {
        common_1.Logger.log('Received request to refresh tokens', AuthService_1.name);
        try {
            const { accessToken, refreshToken } = await this.tokenService.authTokens(userId);
            const hashedRefreshToken = await argon2.hash(refreshToken);
            const id = userId;
            await this.userService.update(id, {
                refreshToken: hashedRefreshToken,
            });
            common_1.Logger.log(`Tokens refreshed successfully for user with id ${id}`, AuthService_1.name);
            return { accessToken, refreshToken };
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthService_1.name);
            throw error;
        }
    }
    async logout(accessToken) {
        common_1.Logger.log('Received request to logout', AuthService_1.name);
        try {
            const decoded = await this.tokenService.verify(accessToken);
            const user = await this.userService.find(AuthService_1, {
                id: decoded,
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid user');
            }
            await this.userService.update(user.id, { refreshToken: null });
            common_1.Logger.log(`Logout successful for user with email ${user.id}`, AuthService_1.name);
            return {
                message: 'Logout successful',
            };
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthService_1.name);
            throw error;
        }
    }
    async forgotPassword(email) {
        const user = await this.userService.find(AuthService_1, { email });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const token = await this.tokenService.generate(user.id);
        const resetLink = (0, link_util_1.generateLink)({
            endpoint: '/reset-password',
            query: { token },
        });
        await this.mailService.sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.userService.find(AuthService_1, { id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await argon2.verify(user.password, changePasswordDto.currentPassword);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordIsCurrentPassword = await argon2.verify(user.password, changePasswordDto.newPassword);
        if (newPasswordIsCurrentPassword) {
            throw new common_1.BadRequestException('New password cannot be the same as the current password');
        }
        const hashedPassword = await argon2.hash(changePasswordDto.newPassword);
        await this.userService.update(userId, { password: hashedPassword });
    }
    async resetPassword(token, newPassword) {
        const userId = await this.tokenService.verify(token);
        const user = await this.userService.find(AuthService_1, { id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const hashedPassword = await argon2.hash(newPassword);
        await this.userService.update(userId, { password: hashedPassword });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        token_service_1.TokenService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map