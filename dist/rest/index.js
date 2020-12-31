"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../constants");
const User_1 = require("../entities/User");
const cookies_1 = require("../utils/cookies");
const createJWT_1 = require("../utils/createJWT");
exports.router = express_1.Router();
exports.router.get("/", (_, res) => res.send("<h1>Welcome to Quacker</h1>"));
exports.router.post("/refresh_token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!refreshToken || refreshToken === "undefined") {
        return res.status(400).json({ message: "No refresh token" });
    }
    try {
        const payload = jsonwebtoken_1.verify(refreshToken, constants_1.REFRESH_TOKEN_SECRET);
        const user = yield User_1.User.findOne(payload === null || payload === void 0 ? void 0 : payload.userId);
        if (!user || user === undefined) {
            return res.status(400).json({ message: "No user found" });
        }
        const accessToken = createJWT_1.createAccessToken(user);
        const newRefreshToken = createJWT_1.createRefreshToken(user);
        cookies_1.setTokens(res, accessToken, newRefreshToken);
        return res.sendStatus(200);
    }
    catch ({ message }) {
        return res.status(400).json({ message });
    }
}));
//# sourceMappingURL=index.js.map