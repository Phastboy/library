"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = void 0;
const setAuthCookies = (res, accessToken, refreshToken, cookieOptions) => {
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
exports.setAuthCookies = setAuthCookies;
//# sourceMappingURL=cookie.util.js.map