"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
const profile_controller_1 = require("./profile.controller");
const users_module_1 = require("../users/users.module");
const users_service_1 = require("../users/users.service");
const prisma_module_1 = require("../prisma/prisma.module");
const prisma_service_1 = require("../prisma/prisma.service");
const token_module_1 = require("../token/token.module");
const token_service_1 = require("../token/token.service");
const auth_module_1 = require("../auth/auth.module");
const auth_service_1 = require("../auth/auth.service");
const mail_module_1 = require("../mail/mail.module");
const mail_service_1 = require("../mail/mail.service");
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, prisma_module_1.PrismaModule, token_module_1.TokenModule, auth_module_1.AuthModule, mail_module_1.MailModule],
        controllers: [profile_controller_1.ProfileController],
        providers: [
            profile_service_1.ProfileService,
            users_service_1.UsersService,
            prisma_service_1.PrismaService,
            token_service_1.TokenService,
            auth_service_1.AuthService,
            mail_service_1.MailService,
        ],
    })
], ProfileModule);
//# sourceMappingURL=profile.module.js.map