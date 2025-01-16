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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../decorators/roles.decorator");
const role_guard_1 = require("../auth/role.guard");
const client_1 = require("@prisma/client");
const auth_guard_1 = require("../auth/auth.guard");
const response_util_1 = require("../utils/response.util");
let UsersController = UsersController_1 = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(res) {
        common_1.Logger.log('Finding all users...', UsersController_1.name);
        try {
            const users = await this.usersService.findAll();
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'Users fetched successfully',
                data: { users },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersController_1.name);
            throw error;
        }
    }
    async findOne(id, res) {
        common_1.Logger.log(`Finding user with id ${id}`, UsersController_1.name);
        try {
            const user = await this.usersService.find(UsersController_1, { id });
            if (!user) {
                throw new Error('User not found');
            }
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'User fetched successfully',
                data: { user },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersController_1.name);
            throw error;
        }
    }
    async deleteUser(id, res) {
        common_1.Logger.log(`Deleting user with id ${id}`, UsersController_1.name);
        try {
            const result = await this.usersService.delete(id);
            if (!result) {
                throw new Error('User not found');
            }
            return response_util_1.response.send({
                res,
                statusCode: 200,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersController_1.name);
            throw error;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users fetched successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User fetched successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiTags)('users'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map