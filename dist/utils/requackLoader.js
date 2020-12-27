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
exports.requackLoaderByUserId = exports.requackLoaderByQuackId = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const Requack_1 = require("../entities/Requack");
const requackLoaderByQuackId = () => new dataloader_1.default((quackids) => __awaiter(void 0, void 0, void 0, function* () {
    const requacks = yield Requack_1.Requack.find({
        where: {
            quackId: typeorm_1.In(quackids),
        },
    });
    return quackids.map((quackId) => requacks.filter((requack) => requack.quackId === quackId));
}));
exports.requackLoaderByQuackId = requackLoaderByQuackId;
const requackLoaderByUserId = () => new dataloader_1.default((userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const requacks = yield Requack_1.Requack.find({
        where: {
            userId: typeorm_1.In(userIds),
        },
    });
    return userIds.map((userId) => requacks.filter((requack) => requack.userId === userId));
}));
exports.requackLoaderByUserId = requackLoaderByUserId;
//# sourceMappingURL=requackLoader.js.map