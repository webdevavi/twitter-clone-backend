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
exports.likeLoader = exports.likeLoaderByUserId = exports.likeLoaderByQuackId = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const Like_1 = require("../entities/Like");
const likeLoaderByQuackId = () => new dataloader_1.default((quackids) => __awaiter(void 0, void 0, void 0, function* () {
    const likes = yield Like_1.Like.find({
        where: {
            quackId: typeorm_1.In(quackids),
        },
    });
    return quackids.map((quackId) => likes.filter((like) => like.quackId === quackId));
}));
exports.likeLoaderByQuackId = likeLoaderByQuackId;
const likeLoaderByUserId = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const likes = yield Like_1.Like.find({
        where: {
            userId: typeorm_1.In(userIds),
        },
    });
    return userIds.map((userId) => likes.filter((like) => like.userId === userId));
}));
exports.likeLoaderByUserId = likeLoaderByUserId;
const likeLoader = () => new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
    const likes = yield Like_1.Like.find({
        where: {
            quackId: typeorm_1.In(keys.map((key) => key.quackId)),
            userId: typeorm_1.In(keys.map((key) => key.userId)),
        },
    });
    return keys.map((key) => likes.filter((like) => like.quackId === key.quackId && like.userId === key.userId));
}));
exports.likeLoader = likeLoader;
//# sourceMappingURL=likeLoader.js.map