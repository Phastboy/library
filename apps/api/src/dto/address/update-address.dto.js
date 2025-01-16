"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAddressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_address_dto_1 = require("./create-address.dto");
class UpdateAddressDto extends (0, swagger_1.PartialType)(create_address_dto_1.CreateAddressDto) {
}
exports.UpdateAddressDto = UpdateAddressDto;
//# sourceMappingURL=update-address.dto.js.map