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
exports.followLoader = exports.followLoaderByFollowerId = exports.followLoaderByUserId = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const Follow_1 = require("../entities/Follow");
const followLoaderByUserId = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const follows = yield Follow_1.Follow.find({
        where: {
            userId: typeorm_1.In(userIds),
        },
    });
    return userIds.map((userId) => follows.filter((follow) => follow.userId === userId));
}));
exports.followLoaderByUserId = followLoaderByUserId;
const followLoaderByFollowerId = () => new dataloader_1.default((followerIds) => __awaiter(void 0, void 0, void 0, function* () {
    const follows = yield Follow_1.Follow.find({
        where: {
            followerId: typeorm_1.In(followerIds),
        },
    });
    return followerIds.map((followerId) => follows.filter((follow) => follow.followerId === followerId));
}));
exports.followLoaderByFollowerId = followLoaderByFollowerId;
const followLoader = () => new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
    const follows = yield Follow_1.Follow.find({
        where: {
            userId: typeorm_1.In(keys.map((key) => key.userId)),
            followerId: typeorm_1.In(keys.map((key) => key.followerId)),
        },
    });
    return keys.map((key) => follows.filter((follow) => follow.userId === key.userId && follow.followerId === key.followerId));
}));
exports.followLoader = followLoader;
//# sourceMappingURL=followLoader.js.map