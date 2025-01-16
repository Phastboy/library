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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AddressesService = class AddressesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createAddressDto) {
        return await this.prisma.address.create({
            data: {
                userId,
                apartmentNumber: createAddressDto.apartmentNumber,
                street: createAddressDto.street,
                city: createAddressDto.city,
                country: createAddressDto.country,
                postalCode: createAddressDto.postalCode,
            },
        });
    }
    async findAll() {
        return await this.prisma.address.findMany();
    }
    async findOne(id) {
        return await this.prisma.address.findUnique({
            where: { id },
        });
    }
    async update(id, updateAddressDto) {
        return await this.prisma.address.update({
            where: { id },
            data: updateAddressDto,
        });
    }
    async remove(id) {
        return await this.prisma.address.delete({
            where: { id },
        });
    }
    async addressForUser(userId) {
        const userAddress = await this.prisma.address.findUnique({
            where: { userId },
        });
        if (userAddress) {
            return userAddress;
        }
        return null;
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map