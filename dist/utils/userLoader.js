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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoaderByUsername = exports.userLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const userLoader = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.User.findByIds(userIds);
    const userIdToUser = {};
    users.forEach((u) => {
        userIdToUser[u.id] = u;
    });
    return userIds.map((userId) => userIdToUser[userId]);
}));
exports.userLoader = userLoader;
const userLoaderByUsername = () => new dataloader_1.default((usernames) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.User.find({
        where: {
            rawUsername: typeorm_1.In(usernames.map((username) => username.toLowerCase())),
        },
    });
    const usernameToUser = {};
    users.forEach((u) => {
        usernameToUser[u.username.toLowerCase()] = u;
    });
    return usernames.map((username) => usernameToUser[username]);
}));
exports.userLoaderByUsername = userLoaderByUsername;
//# sourceMappingURL=userLoader.js.map