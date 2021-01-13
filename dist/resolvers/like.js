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
exports.LikeResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const PaginatedQuacks_1 = require("../response/PaginatedQuacks");
const PaginatedUsers_1 = require("../response/PaginatedUsers");
const likesOrRequacksByQuackId_1 = require("../utils/likesOrRequacksByQuackId");
const likesOrRequacksByUserId_1 = require("../utils/likesOrRequacksByUserId");
let LikeResolver = class LikeResolver {
    like(quackId, { payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = user.id;
            const quack = yield Quack_1.Quack.findOne(quackId);
            console.log(quack);
            if (!quack) {
                return false;
            }
            const like = yield Like_1.Like.findOne({ where: { quackId, userId } });
            if (like) {
                yield like.remove();
                return true;
            }
            yield Like_1.Like.insert({ quackId, userId });
            return true;
        });
    }
    likesByQuackId(quackId, limit, lastIndex, { likeLoaderByQuackId, blockLoaderByUserId, payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { users, hasMore } = yield likesOrRequacksByQuackId_1.likesOrRequacksByQuackId({
                quackId,
                user,
                limit,
                lastIndex,
                blockLoaderByUserId,
                loaderByQuackId: likeLoaderByQuackId,
            });
            return {
                users,
                hasMore,
            };
        });
    }
    likesByUserId(userId, limit, lastIndex, { likeLoaderByUserId, blockLoaderByUserId, payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { quacks, hasMore } = yield likesOrRequacksByUserId_1.likesOrRequacksByUserId({
                userId,
                user,
                limit,
                lastIndex,
                blockLoaderByUserId,
                loaderByUserId: likeLoaderByUserId,
            });
            return {
                quacks,
                hasMore,
            };
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("quackId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LikeResolver.prototype, "like", null);
__decorate([
    type_graphql_1.Query(() => PaginatedUsers_1.PaginatedUsers, { nullable: true }),
    __param(0, type_graphql_1.Arg("quackId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(2, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], LikeResolver.prototype, "likesByQuackId", null);
__decorate([
    type_graphql_1.Query(() => PaginatedQuacks_1.PaginatedQuacks, { nullable: true }),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(2, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], LikeResolver.prototype, "likesByUserId", null);
LikeResolver = __decorate([
    type_graphql_1.Resolver(Like_1.Like)
], LikeResolver);
exports.LikeResolver = LikeResolver;
//# sourceMappingURL=like.js.map