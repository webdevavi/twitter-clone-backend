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
exports.isActive = void 0;
const User_1 = require("../entities/User");
const isActive = ({ context }, next) => __awaiter(void 0, void 0, void 0, function* () {
    const myUserId = context.req.session.userId;
    const user = yield User_1.User.findOne(myUserId);
    if (!user) {
        throw Error("Your account no longer exists.");
    }
    if (user.amIDeactivated)
        throw Error("Your account has been deactivated.");
    return next();
});
exports.isActive = isActive;
//# sourceMappingURL=isActive.js.map