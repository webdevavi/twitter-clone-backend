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
const User_1 = require("../entities/User");
const createJWT_1 = require("../utils/createJWT");
const constants_1 = require("../constants");
exports.router = express_1.Router();
exports.router.get("/", (_, res) => {
    res.send(`
    <h1>Welcome to Quacker's REST API</h1>
    <p>Head over to <a href="/graphql">${constants_1.ENDPOINT}/graphql</a> for GraphQL.</p>
    `);
});
exports.router.post("/refresh_token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies[constants_1.COOKIE_NAME];
    if (!token) {
        res.json({ ok: false, accessToken: "" });
    }
    let payload = { userId: "" };
    try {
        payload = jsonwebtoken_1.verify(token, constants_1.REFRESH_TOKEN_SECRET);
    }
    catch (e) {
        console.log(e);
        res.json({ ok: false, accessToken: "" });
    }
    const user = yield User_1.User.findOne(payload === null || payload === void 0 ? void 0 : payload.userId);
    if (!user) {
        res.json({ ok: false, accessToken: "" });
    }
    else
        return res.json({ ok: true, accessToken: createJWT_1.createAccessToken(user) });
    return res.json({ ok: false, accessToken: "" });
}));
//# sourceMappingURL=index.js.map