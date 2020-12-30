"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTokensToCookie = void 0;
const constants_1 = require("../constants");
const setTokensToCookie = (res, accessToken, refreshToken) => {
    res.cookie(constants_1.ACCESS_TOKEN, accessToken, {
        maxAge: 1000 * 60,
    });
    res.cookie(constants_1.REFRESH_TOKEN, refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });
};
exports.setTokensToCookie = setTokensToCookie;
//# sourceMappingURL=setTokensToCookie.js.map