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
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const forgotPassword_1 = require("../emailTemplates/forgotPassword");
const verifyEmail_1 = require("../emailTemplates/verifyEmail");
const Block_1 = require("../entities/Block");
const Cache_1 = require("../entities/Cache");
const Follow_1 = require("../entities/Follow");
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const User_1 = require("../entities/User");
const UserInput_1 = require("../input/UserInput");
const UserResponse_1 = require("../response/UserResponse");
const createJWT_1 = require("../utils/createJWT");
const regexp_1 = require("../utils/regexp");
const sendEmail_1 = require("../utils/sendEmail");
const setTokensToCookie_1 = require("../utils/setTokensToCookie");
const user_1 = require("../validators/user");
let UserResolver = class UserResolver {
    followers(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const follows = yield Follow_1.Follow.find({ where: { userId: user.id } });
            const followersIds = follows.map((follow) => follow.followerId);
            return yield User_1.User.findByIds(followersIds);
        });
    }
    followings(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const follows = yield Follow_1.Follow.find({ where: { followerId: user.id } });
            const followingsIds = follows.map((follow) => follow.userId);
            return yield User_1.User.findByIds(followingsIds);
        });
    }
    quacks(user) {
        if (user.amIDeactivated)
            return null;
        return Quack_1.Quack.find({ where: { quackedByUserId: user.id } });
    }
    requacks(user, { requackLoaderByUserId }) {
        if (user.amIDeactivated)
            return null;
        return requackLoaderByUserId.load(user.id);
    }
    likes(user, { likeLoaderByUserId }) {
        if (user.amIDeactivated)
            return null;
        return likeLoaderByUserId.load(user.id);
    }
    haveIBlockedThisUser(user, { payload }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const block = yield Block_1.Block.findOne({
                where: { userId: user.id, blockedByUserId: myUserId },
            });
            if (!block)
                return false;
            return true;
        });
    }
    amIBlockedByThisUser(user, { payload }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const block = yield Block_1.Block.findOne({
                where: { userId: myUserId, blockedByUserId: user.id },
            });
            if (!block)
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
                username,
                email,
                password: hashedPassword,
            });
            try {
                yield user.save();
                const token = uuid_1.v4();
                yield Cache_1.Cache.insert({ key: constants_1.VERIFY_EMAIL_PREFIX + token, value: user.id });
                const template = verifyEmail_1.verifyEmailTemplate(constants_1.ORIGIN + "/verifyEmail?token=" + token);
                yield sendEmail_1.sendEmail(user.email, template, "Verify your email - Quacker");
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
                    else if (error.detail.includes("username")) {
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
    login(emailOrUsername, password, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEmail = regexp_1.validEmail.test(emailOrUsername);
            const user = yield User_1.User.findOne({
                where: isEmail
                    ? { email: emailOrUsername }
                    : { username: emailOrUsername },
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
                setTokensToCookie_1.setTokensToCookie(res, accessToken, refreshToken);
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
    sendEmailVerificationLink({ payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield Cache_1.Cache.findOne({ where: { value: user === null || user === void 0 ? void 0 : user.id } });
            let token;
            if (cache) {
                token = cache.key.slice(constants_1.VERIFY_EMAIL_PREFIX.length);
            }
            else {
                token = uuid_1.v4();
                yield Cache_1.Cache.insert({
                    key: constants_1.VERIFY_EMAIL_PREFIX + token,
                    value: user === null || user === void 0 ? void 0 : user.id,
                });
            }
            const template = verifyEmail_1.verifyEmailTemplate(constants_1.ORIGIN + "/verify-email?token=" + token);
            yield sendEmail_1.sendEmail(user === null || user === void 0 ? void 0 : user.email, template, "Verify your email - Quacker");
            return true;
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "The token is required.",
                        },
                    ],
                };
            }
            const key = constants_1.VERIFY_EMAIL_PREFIX + token;
            const cache = yield Cache_1.Cache.findOne(key);
            if (!cache) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "The token is expired.",
                        },
                    ],
                };
            }
            const user = yield User_1.User.findOne(cache.value);
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "User no longer exists.",
                        },
                    ],
                };
            }
            if (!user.emailVerified) {
                user.emailVerified = true;
                yield user.save();
            }
            yield Cache_1.Cache.delete(key);
            return { user };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                return true;
            }
            const cache = yield Cache_1.Cache.findOne({ where: { value: user.id } });
            let token;
            if (cache) {
                token = cache.key.slice(constants_1.FORGOT_PASSWORD_PREFIX.length);
            }
            else {
                token = uuid_1.v4();
                yield Cache_1.Cache.insert({
                    key: constants_1.FORGOT_PASSWORD_PREFIX + token,
                    value: user.id,
                });
            }
            const template = forgotPassword_1.forgotPasswordTemplate(constants_1.ORIGIN + "/reset-password?token=" + token);
            yield sendEmail_1.sendEmail(user.email, template, "Reset your password - Quacker");
            return true;
        });
    }
    changePasswordWithToken(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = new user_1.ValidateUser({ newPassword }).validate();
            if (errors.length !== 0) {
                return { errors };
            }
            const key = constants_1.FORGOT_PASSWORD_PREFIX + token;
            const cache = yield Cache_1.Cache.findOne(key);
            if (!cache) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "Token expired.",
                        },
                    ],
                };
            }
            const user = yield User_1.User.findOne(cache.value);
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "User no longer exists.",
                        },
                    ],
                };
            }
            const hashedPassword = yield argon2_1.default.hash(newPassword);
            user.password = hashedPassword;
            yield User_1.User.update({ id: cache.value }, { password: hashedPassword });
            yield Cache_1.Cache.delete(key);
            return { user };
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
    deactivate(password, { payload: { user }, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield argon2_1.default.verify(user.password, password)) {
                user.amIDeactivated = true;
                yield user.save();
                yield Quack_1.Quack.update({ quackedByUserId: user === null || user === void 0 ? void 0 : user.id }, { isVisible: false });
                res.clearCookie(constants_1.ACCESS_TOKEN);
                res.clearCookie(constants_1.REFRESH_TOKEN);
                return { user };
            }
            else {
                return {
                    errors: [{ field: "password", message: "The password is incorrect." }],
                };
            }
        });
    }
    activate({ payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            user.amIDeactivated = false;
            yield user.save();
            yield Quack_1.Quack.update({ quackedByUserId: user === null || user === void 0 ? void 0 : user.id }, { isVisible: true });
            return { user };
        });
    }
    logout({ res }) {
        res.clearCookie(constants_1.ACCESS_TOKEN);
        res.clearCookie(constants_1.REFRESH_TOKEN);
        return true;
    }
    me({ payload: { user } }) {
        return user;
    }
    user(userId) {
        return User_1.User.findOne(userId);
    }
};
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followers", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followings", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Quack_1.Quack], { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "quacks", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Requack_1.Requack], { nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "requacks", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Like_1.Like], { nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "likes", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "haveIBlockedThisUser", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "amIBlockedByThisUser", null);
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
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(["UNVERIFIED"]),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "sendEmailVerificationLink", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "verifyEmail", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePasswordWithToken", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("password")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePasswordWithOldPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse, { nullable: true }),
    type_graphql_1.Authorized(["ACTIVATED"]),
    __param(0, type_graphql_1.Arg("password")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deactivate", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse, { nullable: true }),
    type_graphql_1.Authorized(["DEACTIVATED"]),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "activate", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
], UserResolver.prototype, "user", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map