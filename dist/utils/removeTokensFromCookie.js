"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTokensFromCookie = void 0;
const constants_1 = require("../constants");
const removeTokensFromCookie = (res) => {
    res.clearCookie(constants_1.ACCESS_TOKEN, {
        sameSite: constants_1.__prod__ && "none",
        secure: constants_1.__prod__,
        httpOnly: constants_1.__prod__,
    });
    res.clearCookie(constants_1.REFRESH_TOKEN, {
        sameSite: constants_1.__prod__ && "none",
        secure: constants_1.__prod__,
        httpOnly: constants_1.__prod__,
    });
};
exports.removeTokensFromCookie = removeTokensFromCookie;
//# sourceMappingURL=removeTokensFromCookie.js.map