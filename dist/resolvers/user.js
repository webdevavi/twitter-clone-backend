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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const type_graphql_1 = require("type-graphql");
const Quack_1 = require("../entities/Quack");
const User_1 = require("../entities/User");
const UserInput_1 = require("../input/UserInput");
const partialAuth_1 = require("../middleware/partialAuth");
const PaginatedUsers_1 = require("../response/PaginatedUsers");
const UserResponse_1 = require("../response/UserResponse");
const createJWT_1 = require("../utils/createJWT");
const paginate_1 = require("../utils/paginate");
const regexp_1 = require("../utils/regexp");
const user_1 = require("../validators/user");
let UserResolver = class UserResolver {
    followers(user, { followLoaderByUserId }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield followLoaderByUserId.load(user.id))) === null || _a === void 0 ? void 0 : _a.length) || 0;
        });
    }
    followings(user, { followLoaderByFollowerId }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield followLoaderByFollowerId.load(user.id))) === null || _a === void 0 ? void 0 : _a.length) || 0;
        });
    }
    quacks(user, { quackLoaderByUserId }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield quackLoaderByUserId.load(user.id))) === null || _a === void 0 ? void 0 : _a.length) || 0;
        });
    }
    haveIBlockedThisUser(user, { payload: { user: me }, blockLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!me)
                return null;
            const myUserId = me === null || me === void 0 ? void 0 : me.id;
            if (user.id === myUserId)
                return null;
            const block = yield blockLoader.load({
                userId: user.id,
                blockedByUserId: myUserId,
            });
            if (!block || block.length < 1)
                return false;
            return true;
        });
    }
    amIBlockedByThisUser(user, { payload: { user: me }, blockLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!me)
                return null;
            const myUserId = me === null || me === void 0 ? void 0 : me.id;
            if (user.id === myUserId)
                return null;
            const block = yield blockLoader.load({
                userId: myUserId,
                blockedByUserId: user.id,
            });
            if (!block || block.length < 1)
                return false;
            return true;
        });
    }
    followStatus(user, { payload: { user: me }, followLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!me)
                return null;
            const myUserId = me.id;
            if (user.id === myUserId)
                return null;
            const follow = yield followLoader.load({
                userId: user.id,
                followerId: myUserId,
            });
            if (!follow || follow.length < 1)
                return false;
            return true;
        });
    }
    followBackStatus(user, { payload: { user: me }, followLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!me)
                return null;
            const myUserId = me.id;
            if (user.id === myUserId)
                return null;
            const follow = yield followLoader.load({
                followerId: user.id,
                userId: myUserId,
            });
            if (!follow || follow.length < 1)
                return false;
            return true;
        });
    }
    signup(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = new user_1.ValidateUser(input).validate();
            if (errors.length !== 0) {
                return { errors };
            }
            const { displayName, username, email, password } = input;
            const hashedPassword = yield argon2_1.default.hash(password);
            const user = User_1.User.create({
                displayName,
                rawUsername: username.toLowerCase(),
                username,
                email: email.toLowerCase(),
                password: hashedPassword,
            });
            try {
                yield user.save();
                const accessToken = createJWT_1.createAccessToken(user);
                const refreshToken = createJWT_1.createRefreshToken(user);
                return { user, accessToken, refreshToken };
            }
            catch (error) {
                if (error.detail.includes("already exists")) {
                    if (error.detail.includes("email")) {
                        return {
                            errors: [
                                {
                                    field: "email",
                                    message: "An user with this email already exists.",
                                },
                            ],
                        };
                    }
                    else if (error.detail.includes("rawUsername")) {
                        return {
                            errors: [
                                {
                                    field: "username",
                                    message: "The username is taken.",
                                },
                            ],
                        };
                    }
                }
                throw error;
            }
        });
    }
    login(emailOrUsername, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEmail = regexp_1.validEmail.test(emailOrUsername);
            const user = yield User_1.User.findOne({
                where: isEmail
                    ? { email: emailOrUsername.toLowerCase() }
                    : { rawUsername: emailOrUsername.toLowerCase() },
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "emailOrUsername",
                            message: "The user does not exist.",
                        },
                    ],
                };
            }
            if (yield argon2_1.default.verify(user.password, password)) {
                const accessToken = createJWT_1.createAccessToken(user);
                const refreshToken = createJWT_1.createRefreshToken(user);
                return { user, accessToken, refreshToken };
            }
            else {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "The password is incorrect.",
                        },
                    ],
                };
            }
        });
    }
    changePasswordWithOldPassword(password, newPassword, { payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = new user_1.ValidateUser({ password, newPassword }).validate();
            if (errors.length !== 0) {
                return { errors };
            }
            if (yield argon2_1.default.verify(user.password, password)) {
                const hashedPassword = yield argon2_1.default.hash(newPassword);
                user.password = hashedPassword;
                yield (user === null || user === void 0 ? void 0 : user.save());
                return { user };
            }
            else {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "The password is incorrect.",
                        },
                    ],
                };
            }
        });
    }
    logout() {
        return true;
    }
    me({ payload: { user } }) {
        return user;
    }
    userById(userId) {
        return User_1.User.findOne(userId);
    }
    userByEmail(email) {
        return User_1.User.findOne({ where: { email: email.toLowerCase() } });
    }
    userByUsername(username) {
        return User_1.User.findOne({ where: { rawUsername: username.toLowerCase() } });
    }
    dummyUsers(limit, lastIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const u = User_1.User.createQueryBuilder("u")
                .select("u.*")
                .orderBy({ "u.id": "DESC" }).where(`
        u."isVerified" is not true
      `);
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
    loginAsDummyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(userId);
            if (!user) {
                throw Error("The user does not exist.");
            }
            if (user.isVerified) {
                throw Error("The user is not a dummy user.");
            }
            const accessToken = createJWT_1.createAccessToken(user);
            const refreshToken = createJWT_1.createRefreshToken(user);
            return { user, accessToken, refreshToken };
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { defaultValue: 0 }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followers", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { defaultValue: 0 }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followings", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Quack_1.Quack], { defaultValue: 0 }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "quacks", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "haveIBlockedThisUser", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "amIBlockedByThisUser", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followStatus", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followBackStatus", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserInput_1.UserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signup", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("emailOrUsername")),
    __param(1, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Arg("password")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePasswordWithOldPassword", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userById", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userByEmail", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userByUsername", null);
__decorate([
    type_graphql_1.Query(() => PaginatedUsers_1.PaginatedUsers, { nullable: true }),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(1, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "dummyUsers", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("userId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginAsDummyUser", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map