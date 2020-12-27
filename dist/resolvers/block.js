"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.BlockResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Block_1 = require("../entities/Block");
const Follow_1 = require("../entities/Follow");
const isAuth_1 = require("../middleware/isAuth");
let BlockResolver = class BlockResolver {
    block(userId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = req.session.userId;
            if (userId === myUserId)
                return false;
            const blocked = yield Block_1.Block.findOne({
                where: { userId, blockedByUserId: myUserId },
            });
            if (blocked)
                return true;
            yield typeorm_1.getConnection().transaction((em) => __awaiter(this, void 0, void 0, function* () {
                em.insert(Block_1.Block, { userId, blockedByUserId: myUserId });
                em.delete(Follow_1.Follow, { userId, followerId: myUserId });
                em.delete(Follow_1.Follow, { userId: myUserId, followerId: userId });
            }));
            return true;
        });
    }
    unblock(userId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = req.session.userId;
            if (userId === myUserId)
                return false;
            const blocked = yield Block_1.Block.findOne({
                where: { userId, blockedByUserId: myUserId },
            });
            if (!blocked)
                return true;
            yield Block_1.Block.delete({ userId, blockedByUserId: myUserId });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("userId")), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlockResolver.prototype, "block", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("userId")), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlockResolver.prototype, "unblock", null);
BlockResolver = __decorate([
    type_graphql_1.Resolver(Block_1.Block)
], BlockResolver);
exports.BlockResolver = BlockResolver;
//# sourceMappingURL=block.js.map