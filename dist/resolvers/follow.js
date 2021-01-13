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
const Block_1 = require("../entities/Block");
const Follow_1 = require("../entities/Follow");
const User_1 = require("../entities/User");
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
    followersByUserId(userId, { followLoaderByUserId, userLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const follows = yield followLoaderByUserId.load(userId);
            if (!follows)
                return [];
            const userIds = follows.map((follow) => follow.followerId);
            return yield userLoader.loadMany(userIds);
        });
    }
    followingsByUserId(userId, { followLoaderByFollowerId, userLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const follows = yield followLoaderByFollowerId.load(userId);
            if (!follows)
                return [];
            const userIds = follows.map((follow) => follow.userId);
            return yield userLoader.loadMany(userIds);
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
    type_graphql_1.Query(() => [User_1.User], { nullable: true }),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followersByUserId", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User], { nullable: true }),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followingsByUserId", null);
FollowResolver = __decorate([
    type_graphql_1.Resolver(Follow_1.Follow)
], FollowResolver);
exports.FollowResolver = FollowResolver;
//# sourceMappingURL=follow.js.map