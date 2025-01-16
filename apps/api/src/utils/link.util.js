"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLink = void 0;
const generateLink = (args) => {
    const baseUrl = process.env.API_URL || 'http://localhost:8080';
    const url = new URL(args.endpoint, baseUrl);
    if (args.query) {
        Object.entries(args.query).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }
    return url.toString();
};
exports.generateLink = generateLink;
//# sourceMappingURL=link.util.js.map