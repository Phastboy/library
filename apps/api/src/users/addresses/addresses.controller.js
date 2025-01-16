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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesController = void 0;
const common_1 = require("@nestjs/common");
const addresses_service_1 = require("./addresses.service");
const create_address_dto_1 = require("../../dto/address/create-address.dto");
const update_address_dto_1 = require("../../dto/address/update-address.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/auth.guard");
let AddressesController = class AddressesController {
    constructor(addressesService) {
        this.addressesService = addressesService;
    }
    async create(req, createAddressDto) {
        const { userId } = await req;
        return await this.addressesService.create(userId, createAddressDto);
    }
    async findAll() {
        return await this.addressesService.findAll();
    }
    async myAddress(req) {
        common_1.Logger.log('User ID: ' + req.userId);
        const { userId } = req;
        const myAddress = await this.addressesService.addressForUser(userId);
        if (myAddress) {
            return myAddress;
        }
        throw new common_1.NotFoundException('This user does not have an address');
    }
    async findOne(req, id) {
        const { userId } = await req;
        return await this.addressesService.findOne(userId);
    }
    async update(req, id, updateAddressDto) {
        const { userId } = await req;
        return await this.addressesService.update(userId, updateAddressDto);
    }
    async remove(req, id) {
        const { userId } = await req;
        return await this.addressesService.remove(userId);
    }
};
exports.AddressesController = AddressesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new address' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Address created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_address_dto_1.CreateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all addresses' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Addresses fetched successfully.',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get address for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address fetched successfully.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "myAddress", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get address by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Address ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address fetched successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update address by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Address ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_address_dto_1.UpdateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete address by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Address ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "remove", null);
exports.AddressesController = AddressesController = __decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiTags)('addresses'),
    (0, common_1.Controller)('addresses'),
    __metadata("design:paramtypes", [addresses_service_1.AddressesService])
], AddressesController);
//# sourceMappingURL=addresses.controller.js.map