"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../constants");
function getPayload(user) {
    return {
        userId: user.id,
    };
}
const createAccessToken = (user) => jsonwebtoken_1.sign(getPayload(user), constants_1.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
});
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => jsonwebtoken_1.sign(getPayload(user), constants_1.REFRESH_TOKEN_SECRET, {
    expiresIn: "1y",
});
exports.createRefreshToken = createRefreshToken;
//# sourceMappingURL=createJWT.js.map