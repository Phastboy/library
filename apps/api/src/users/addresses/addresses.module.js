"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesModule = void 0;
const common_1 = require("@nestjs/common");
const addresses_service_1 = require("./addresses.service");
const addresses_controller_1 = require("./addresses.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const prisma_service_1 = require("../../prisma/prisma.service");
const token_module_1 = require("../../token/token.module");
const token_service_1 = require("../../token/token.service");
let AddressesModule = class AddressesModule {
};
exports.AddressesModule = AddressesModule;
exports.AddressesModule = AddressesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, token_module_1.TokenModule],
        controllers: [addresses_controller_1.AddressesController],
        providers: [addresses_service_1.AddressesService, prisma_service_1.PrismaService, token_service_1.TokenService],
    })
], AddressesModule);
//# sourceMappingURL=addresses.module.js.map