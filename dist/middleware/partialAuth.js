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
exports.partialAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../constants");
const partialAuth = ({ context }, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const accessToken = (_a = context.req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!accessToken)
        return next();
    try {
        const payload = jsonwebtoken_1.verify(accessToken, constants_1.ACCESS_TOKEN_SECRET);
        if (!(payload === null || payload === void 0 ? void 0 : payload.userId)) {
            return false;
        }
        const user = yield context.userLoader.load(payload === null || payload === void 0 ? void 0 : payload.userId);
        if (!user)
            return next();
        context.payload.user = user;
        return next();
    }
    catch (error) {
        console.log(error);
        return next();
    }
});
exports.partialAuth = partialAuth;
//# sourceMappingURL=partialAuth.js.map