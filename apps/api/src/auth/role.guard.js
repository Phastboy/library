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
var RoleGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
const users_service_1 = require("../users/users.service");
let RoleGuard = RoleGuard_1 = class RoleGuard {
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles) {
            return true;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        const userId = request.userId;
        common_1.Logger.log(`User ID: ${userId} requesting access with roles: ${requiredRoles.join(', ')}`, RoleGuard_1.name);
        const user = await this.usersService.find(RoleGuard_1, { id: userId });
        if (!user) {
            common_1.Logger.warn(`User with ID: ${userId} not found`, RoleGuard_1.name);
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.role || !requiredRoles.includes(user.role)) {
            common_1.Logger.warn(`User with ID: ${userId} does not have required role. User role: ${user.role}`, RoleGuard_1.name);
            throw new common_1.UnauthorizedException(`You do not have the required role. Required: ${requiredRoles.join(', ')}, Your Role: ${user.role}`);
        }
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = RoleGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        users_service_1.UsersService])
], RoleGuard);
//# sourceMappingURL=role.guard.js.map