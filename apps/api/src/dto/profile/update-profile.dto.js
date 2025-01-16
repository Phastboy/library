"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_profile_dto_1 = require("./create-profile.dto");
class UpdateProfileDto extends (0, swagger_1.PartialType)(create_profile_dto_1.CreateProfileDto) {
}
exports.UpdateProfileDto = UpdateProfileDto;
//# sourceMappingURL=update-profile.dto.js.map