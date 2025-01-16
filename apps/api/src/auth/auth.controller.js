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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("../dto/user/create-user.dto");
const login_dto_1 = require("../dto/auth/login.dto");
const token_service_1 = require("../token/token.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("./auth.guard");
const refresh_guard_1 = require("./refresh.guard");
const response_util_1 = require("../utils/response.util");
const password_dto_1 = require("../dto/auth/password.dto");
const cookie_util_1 = require("../utils/cookie.util");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, tokenService) {
        this.authService = authService;
        this.tokenService = tokenService;
    }
    async create(createUserDto, res) {
        try {
            const { details, accessToken, refreshToken } = await this.authService.create(createUserDto);
            const user = details;
            (0, cookie_util_1.setAuthCookies)(res, accessToken, refreshToken, {
                ...this.authService.cookieOptions,
                sameSite: 'strict',
            });
            common_1.Logger.log(`cookies set`, AuthController_1.name);
            return response_util_1.response.send({
                res,
                statusCode: 201,
                message: 'User successfully registered',
                data: { user },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async verifyEmail(token, res) {
        common_1.Logger.log(`Received request to verify email with token ${token}`, AuthController_1.name);
        try {
            if (!token) {
                throw new common_1.BadRequestException('Token is required');
            }
            const data = await this.authService.verifyEmail(token);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Email successfully verified',
                data,
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async login(loginDto, res) {
        common_1.Logger.log('Received request to login', AuthController_1.name);
        try {
            const { accessToken, refreshToken } = await this.authService.login(loginDto);
            (0, cookie_util_1.setAuthCookies)(res, accessToken, refreshToken, this.authService.cookieOptions);
            common_1.Logger.log(`cookies set`, AuthController_1.name);
            common_1.Logger.log(`Login successful for user with email ${loginDto.email}`, AuthController_1.name);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Login successful',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async refreshTokens(req, res) {
        common_1.Logger.log('Received request to refresh tokens', AuthController_1.name);
        try {
            common_1.Logger.log(`Request headers: ${JSON.stringify(req.headers)}`, AuthController_1.name);
            const token = req.userId;
            common_1.Logger.log(`token: ${token}`, AuthController_1.name);
            const { accessToken, refreshToken } = await this.authService.refreshTokens(token);
            (0, cookie_util_1.setAuthCookies)(res, accessToken, refreshToken, this.authService.cookieOptions);
            common_1.Logger.log(`cookies set`, AuthController_1.name);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Tokens refreshed successfully',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async logout(req, res) {
        common_1.Logger.log('Received request to logout', AuthController_1.name);
        try {
            const cookies = req.headers?.cookie;
            common_1.Logger.log(`cookies: ${JSON.stringify(cookies)}`, AuthController_1.name);
            const accessToken = cookies
                ?.split(';')
                .find((cookie) => cookie.trim().startsWith('accessToken='))
                ?.split('=')[1];
            common_1.Logger.log(`refreshToken: ${accessToken}`, AuthController_1.name);
            if (!accessToken) {
                common_1.Logger.error('Refresh token not found', AuthController_1.name);
                throw new Error('Refresh token not found');
            }
            await this.authService.logout(accessToken);
            await res.clearCookie('accessToken', {
                ...this.authService.cookieOptions,
                sameSite: 'strict',
            });
            await res.clearCookie('refreshToken', {
                ...this.authService.cookieOptions,
                sameSite: 'strict',
            });
            common_1.Logger.log(`cookies cleared`, AuthController_1.name);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Logout successful',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async changePassword(req, changePasswordDto, res) {
        common_1.Logger.log('Received request to change password', AuthController_1.name);
        try {
            await this.authService.changePassword(req.userId, changePasswordDto);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async forgotPassword(forgotPasswordDto, res) {
        common_1.Logger.log('Received request to reset password', AuthController_1.name);
        try {
            await this.authService.forgotPassword(forgotPasswordDto.email);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Password reset email sent',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
    async resetPassword(resetPasswordDto, token, res) {
        common_1.Logger.log('Received request to reset password', AuthController_1.name);
        try {
            await this.authService.resetPassword(token, resetPasswordDto.newPassword);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Password reset successfully',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, AuthController_1.name);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address' }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        type: 'string',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email successfully verified.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token.' }),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'Pas$word123' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(refresh_guard_1.RefreshGuard),
    (0, common_1.Get)('refresh-tokens'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access and refresh tokens' }),
    (0, swagger_1.ApiCookieAuth)('refreshToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens refreshed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)('change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_dto_1.ForgotPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Patch)('reset-password'),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        type: 'string',
        required: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Reset user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_dto_1.ResetPasswordDto, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('authentication'),
    (0, common_1.Controller)(''),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        token_service_1.TokenService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map