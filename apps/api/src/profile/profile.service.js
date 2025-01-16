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
var ProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let ProfileService = ProfileService_1 = class ProfileService {
    constructor(userService) {
        this.userService = userService;
    }
    async read(userId) {
        common_1.Logger.log('Received request to get profile', ProfileService_1.name);
        const user = await this.userService.find(ProfileService_1, {
            id: userId,
        });
        if (!user) {
            common_1.Logger.error('User not found', ProfileService_1.name);
            throw new common_1.BadRequestException('User not found');
        }
        return this.userService.stripSensitiveFields(user);
    }
    async update(userId, updateUserDto) {
        common_1.Logger.log('Received request to update profile', ProfileService_1.name);
        try {
            const user = await this.userService.update(userId, updateUserDto);
            return user;
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, ProfileService_1.name);
            throw error;
        }
    }
    async delete(userId) {
        common_1.Logger.log('Received request to delete profile', ProfileService_1.name);
        try {
            const { id, refreshToken, password, ...profile } = await this.userService.delete(userId);
            common_1.Logger.log(`Profile deleted for user with id ${userId}`, ProfileService_1.name);
            return profile;
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, ProfileService_1.name);
            throw error;
        }
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = ProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map