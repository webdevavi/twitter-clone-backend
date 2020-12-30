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
const User_1 = require("../entities/User");
let LikeResolver = class LikeResolver {
    quack(like) {
        return Quack_1.Quack.findOne(like.quackId);
    }
    user(like) {
        return User_1.User.findOne(like.userId);
    }
    like(quackId, { payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = user.id;
            const quack = yield Quack_1.Quack.findOne(quackId);
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
};
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Like_1.Like]),
    __metadata("design:returntype", void 0)
], LikeResolver.prototype, "quack", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Like_1.Like]),
    __metadata("design:returntype", void 0)
], LikeResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("quackId")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LikeResolver.prototype, "like", null);
LikeResolver = __decorate([
    type_graphql_1.Resolver(Like_1.Like)
], LikeResolver);
exports.LikeResolver = LikeResolver;
//# sourceMappingURL=like.js.map