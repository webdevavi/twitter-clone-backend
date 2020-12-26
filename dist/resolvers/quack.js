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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuackResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Follow_1 = require("../entities/Follow");
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const User_1 = require("../entities/User");
const QuackInput_1 = require("../input/QuackInput");
const isAuth_1 = require("../middleware/isAuth");
const QuackResponse_1 = require("../response/QuackResponse");
const quack_1 = require("../validators/quack");
const get_urls_1 = __importDefault(require("get-urls"));
let QuackResolver = class QuackResolver {
    truncatedText(quack) {
        if (quack.text.length > 50) {
            return quack.text.slice(0, 50) + "...";
        }
        return null;
    }
    quackedByUser(quack) {
        return User_1.User.findOne(quack.quackedByUserId);
    }
    requacks(quack) {
        return Requack_1.Requack.find({ where: { quackId: quack.id } });
    }
    likes(quack) {
        return Like_1.Like.find({ where: { quackId: quack.id } });
    }
    replies(quack) {
        return Quack_1.Quack.find({ where: { inReplyToQuackId: quack.id } });
    }
    urls(quack) {
        const urlsSet = get_urls_1.default(quack.text);
        return [...urlsSet];
    }
    quack({ text, inReplyToQuackId }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = new quack_1.QuackValidator(text).validate();
            if (errors.length !== 0) {
                return { errors };
            }
            const inReplyToQuack = yield Quack_1.Quack.findOne(inReplyToQuackId);
            if (!inReplyToQuack)
                return {
                    errors: [
                        {
                            field: "inReplyToQuackId",
                            message: "The quack you are replying to no longer exists.",
                        },
                    ],
                };
            const quack = Quack_1.Quack.create({
                text,
                quackedByUserId: req.session.userId,
                inReplyToQuackId,
            });
            yield quack.save();
            return { quack };
        });
    }
    deleteQuack(quackId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const quack = yield Quack_1.Quack.findOne(quackId);
            if ((quack === null || quack === void 0 ? void 0 : quack.quackedByUserId) !== req.session.userId)
                return false;
            if (!quack)
                return true;
            yield quack.remove();
            return true;
        });
    }
    quacks() {
        return Quack_1.Quack.find();
    }
    quacksFromFollowings({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const follows = yield Follow_1.Follow.find({
                where: { followerId: req.session.userId },
            });
            const followingIds = follows.map((follow) => follow.userId);
            return Quack_1.Quack.find({ where: { quackedByUserId: typeorm_1.In(followingIds) } });
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "truncatedText", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "quackedByUser", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "requacks", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "likes", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "replies", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Quack_1.Quack]),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "urls", null);
__decorate([
    type_graphql_1.Mutation(() => QuackResponse_1.QuackResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QuackInput_1.QuackInput, Object]),
    __metadata("design:returntype", Promise)
], QuackResolver.prototype, "quack", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("quackId")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuackResolver.prototype, "deleteQuack", null);
__decorate([
    type_graphql_1.Query(() => [Quack_1.Quack], { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuackResolver.prototype, "quacks", null);
__decorate([
    type_graphql_1.Query(() => [Quack_1.Quack], { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuackResolver.prototype, "quacksFromFollowings", null);
QuackResolver = __decorate([
    type_graphql_1.Resolver(Quack_1.Quack)
], QuackResolver);
exports.QuackResolver = QuackResolver;
//# sourceMappingURL=quack.js.map