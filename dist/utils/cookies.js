"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTokens = exports.setTokens = void 0;
const constants_1 = require("../constants");
const setTokens = (res, accessToken, refreshToken) => {
    res.cookie(constants_1.ACCESS_TOKEN, accessToken, {
        httpOnly: constants_1.__prod__,
        secure: constants_1.__prod__,
        sameSite: constants_1.__prod__ && "none",
        maxAge: 1000 * 60,
    });
    res.cookie(constants_1.REFRESH_TOKEN, refreshToken, {
        httpOnly: constants_1.__prod__,
        secure: constants_1.__prod__,
        sameSite: constants_1.__prod__ && "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });
};
exports.setTokens = setTokens;
const clearTokens = (res) => {
    res.clearCookie(constants_1.ACCESS_TOKEN, {
        httpOnly: constants_1.__prod__,
        secure: constants_1.__prod__,
        sameSite: constants_1.__prod__ && "none",
    });
    res.clearCookie(constants_1.REFRESH_TOKEN, {
        httpOnly: constants_1.__prod__,
        secure: constants_1.__prod__,
        sameSite: constants_1.__prod__ && "none",
    });
};
exports.clearTokens = clearTokens;
//# sourceMappingURL=cookies.js.map