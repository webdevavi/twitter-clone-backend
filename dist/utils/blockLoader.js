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
exports.blockLoader = exports.blockLoaderByBlockedByUserId = exports.blockLoaderByUserId = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const Block_1 = require("../entities/Block");
const blockLoaderByUserId = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const blocks = yield Block_1.Block.find({
        where: {
            userId: typeorm_1.In(userIds),
        },
    });
    return userIds.map((userId) => blocks.filter((block) => block.userId === userId));
}));
exports.blockLoaderByUserId = blockLoaderByUserId;
const blockLoaderByBlockedByUserId = () => new dataloader_1.default((blockedByUserIds) => __awaiter(void 0, void 0, void 0, function* () {
    const blocks = yield Block_1.Block.find({
        where: {
            blockedByUserId: typeorm_1.In(blockedByUserIds),
        },
    });
    return blockedByUserIds.map((blockedByUserId) => blocks.filter((block) => block.blockedByUserId === blockedByUserId));
}));
exports.blockLoaderByBlockedByUserId = blockLoaderByBlockedByUserId;
const blockLoader = () => new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
    const blocks = yield Block_1.Block.find({
        where: {
            userId: typeorm_1.In(keys.map((key) => key.userId)),
            blockedByUserId: typeorm_1.In(keys.map((key) => key.blockedByUserId)),
        },
    });
    return keys.map((key) => blocks.filter((block) => block.userId === key.userId &&
        block.blockedByUserId === key.blockedByUserId));
}));
exports.blockLoader = blockLoader;
//# sourceMappingURL=blockLoader.js.map