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
exports.FollowResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Block_1 = require("../entities/Block");
const Follow_1 = require("../entities/Follow");
const User_1 = require("../entities/User");
const partialAuth_1 = require("../middleware/partialAuth");
const PaginatedUsers_1 = require("../response/PaginatedUsers");
const paginate_1 = require("../utils/paginate");
let FollowResolver = class FollowResolver {
    follow(userId, { payload: { user: me }, userLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = me === null || me === void 0 ? void 0 : me.id;
            if (userId === myUserId)
                return false;
            const haveIBlocked = yield Block_1.Block.find({
                where: { userId, blockedByUserId: myUserId },
            });
            if ((haveIBlocked === null || haveIBlocked === void 0 ? void 0 : haveIBlocked.length) > 0)
                return false;
            const amIBlocked = yield Block_1.Block.find({
                where: { userId: myUserId, blockedByUserId: userId },
            });
            if ((amIBlocked === null || amIBlocked === void 0 ? void 0 : amIBlocked.length) > 0)
                return false;
            const follow = yield Follow_1.Follow.findOne({
                where: { userId, followerId: myUserId },
            });
            if (follow)
                return true;
            const user = yield userLoader.load(userId);
            if (!user)
                return false;
            if (user.amIDeactivated)
                return false;
            yield Follow_1.Follow.insert({ userId, followerId: myUserId });
            return true;
        });
    }
    unfollow(userId, { payload: { user: me }, userLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const followerId = me === null || me === void 0 ? void 0 : me.id;
            if (userId === followerId)
                return false;
            const follow = yield Follow_1.Follow.findOne({ where: { userId, followerId } });
            if (!follow)
                return true;
            const user = yield userLoader.load(userId);
            if (!user)
                return false;
            if (user.amIDeactivated)
                return false;
            yield Follow_1.Follow.delete({ userId, followerId });
            return true;
        });
    }
    followersByUserId(userId, limit, lastIndex, { followLoaderByUserId, blockLoaderByUserId, payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _fetchFollowsUsers({
                userId,
                followLoader: followLoaderByUserId,
                blockLoaderByUserId,
                user,
                limit,
                lastIndex,
                key: "followerId",
            });
        });
    }
    followingsByUserId(userId, limit, lastIndex, { followLoaderByFollowerId, blockLoaderByUserId, payload: { user }, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _fetchFollowsUsers({
                userId,
                followLoader: followLoaderByFollowerId,
                blockLoaderByUserId,
                user,
                limit,
                lastIndex,
                key: "userId",
            });
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "follow", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "unfollow", null);
__decorate([
    type_graphql_1.Query(() => PaginatedUsers_1.PaginatedUsers, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(2, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followersByUserId", null);
__decorate([
    type_graphql_1.Query(() => PaginatedUsers_1.PaginatedUsers, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(2, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followingsByUserId", null);
FollowResolver = __decorate([
    type_graphql_1.Resolver(Follow_1.Follow)
], FollowResolver);
exports.FollowResolver = FollowResolver;
function _fetchFollowsUsers({ userId, followLoader, blockLoaderByUserId, user, limit, lastIndex, key, }) {
    return __awaiter(this, void 0, void 0, function* () {
        userId;
        const follows = yield followLoader.load(userId);
        if (!follows || follows.length < 1)
            return { users: [], hasMore: false };
        const userIds = follows.map((follow) => follow[key]);
        const u = typeorm_1.getConnection()
            .createQueryBuilder()
            .select("u.*")
            .from(User_1.User, "u")
            .orderBy({ "u.id": "DESC" }).where(`
        u.id in (${userIds.join(",")})
      `);
        if (user) {
            const blockIds = (yield blockLoaderByUserId.load(user.id)).map((block) => block.blockedByUserId);
            if (blockIds && blockIds.length > 0) {
                u.andWhere(`
        u.id not in (${blockIds.join(",")})
    `);
            }
        }
        const { data: users, hasMore } = yield paginate_1.paginate({
            queryBuilder: u,
            limit,
            index: "u.id",
            lastIndex,
        });
        return {
            users,
            hasMore,
        };
    });
}
//# sourceMappingURL=follow.js.map