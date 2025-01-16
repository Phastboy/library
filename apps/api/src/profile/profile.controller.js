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
var ProfileController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
const swagger_1 = require("@nestjs/swagger");
const update_user_dto_1 = require("../dto/user/update-user.dto");
const auth_guard_1 = require("../auth/auth.guard");
const auth_service_1 = require("../auth/auth.service");
const response_util_1 = require("../utils/response.util");
let ProfileController = ProfileController_1 = class ProfileController {
    constructor(profileService, authService) {
        this.profileService = profileService;
        this.authService = authService;
    }
    async getProfile(req, res) {
        common_1.Logger.log('Received request to get profile', ProfileController_1.name);
        try {
            common_1.Logger.log(req.userId, ProfileController_1.name);
            common_1.Logger.log(`Fetching profile for user with id ${req.userId}`, ProfileController_1.name);
            if (!req.userId) {
                common_1.Logger.error('User id is required', ProfileController_1.name);
                throw new Error('User id is required');
            }
            const user = await this.profileService.read(req.userId);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Profile retrieved successfully',
                data: { user },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, ProfileController_1.name);
            throw error;
        }
    }
    async updateProfile(req, updateUserDto, res) {
        common_1.Logger.log('Received request to update profile', ProfileController_1.name);
        try {
            common_1.Logger.log(`Updating profile for user with id ${req.userId}`, ProfileController_1.name);
            if (!req.userId) {
                common_1.Logger.error('User id is required', ProfileController_1.name);
                throw new Error('User id is required');
            }
            const id = req.userId;
            const user = await this.profileService.update(id, updateUserDto);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Profile updated successfully',
                data: { user },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, ProfileController_1.name);
            throw error;
        }
    }
    async deleteProfile(req, res) {
        common_1.Logger.log('Received request to delete profile', ProfileController_1.name);
        try {
            const id = req.userId;
            const deleted = await this.profileService.delete(id);
            await res.clearCookie('accessToken', this.authService.cookieOptions);
            await res.clearCookie('refreshToken', this.authService.cookieOptions);
            common_1.Logger.log(`Profile deleted for user with id ${id}`, ProfileController_1.name);
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Profile deleted successfully',
                data: deleted,
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, ProfileController_1.name);
            throw error;
        }
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile retrieved successfully.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "deleteProfile", null);
exports.ProfileController = ProfileController = ProfileController_1 = __decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map