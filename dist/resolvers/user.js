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
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const User_1 = require("../entities/User");
const UserInput_1 = require("../input/UserInput");
const UserResponse_1 = require("../response/UserResponse");
const createJWT_1 = require("../utils/createJWT");
const regexp_1 = require("../utils/regexp");
const sendEmail_1 = require("../utils/sendEmail");
const user_1 = require("../validators/user");
let UserResolver = class UserResolver {
    followers(user, { followLoaderByUserId }) {
        return followLoaderByUserId.load(user.id);
    }
    followings(user, { followLoaderByFollowerId }) {
        return followLoaderByFollowerId.load(user.id);
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
    haveIBlockedThisUser(user, { payload, blockLoader }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const block = yield blockLoader.load({
                userId: user.id,
                blockedByUserId: myUserId,
            });
            if (!block)
                return false;
            return true;
        });
    }
    amIBlockedByThisUser(user, { payload, blockLoader }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const block = yield blockLoader.load({
                userId: myUserId,
                blockedByUserId: user.id,
            });
            if (!block)
                return false;
            return true;
        });
    }
    followStatus(user, { payload, followLoader }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const follow = yield followLoader.load({
                userId: user.id,
                followerId: myUserId,
            });
            if (!follow)
                return false;
            return true;
        });
    }
    followBackStatus(user, { payload, followLoader }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const myUserId = (_a = payload.user) === null || _a === void 0 ? void 0 : _a.id;
            if (user.id === myUserId)
                return null;
            const follow = yield followLoader.load({
                followerId: user.id,
                userId: myUserId,
            });
            if (!follow)
                return false;
            return true;
        });
    }
    signup(input, { cache }) {
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
                const token = uuid_1.v4();
                const key = constants_1.VERIFY_EMAIL_PREFIX + token;
                yield cache.set(key, user.id, "ex", 1000 * 60 * 60 * 24 * 3);
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
    sendEmailVerificationLink({ payload: { user }, cache }) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = uuid_1.v4();
            const key = constants_1.VERIFY_EMAIL_PREFIX + token;
            yield cache.set(key, user.id, "ex", 1000 * 60 * 60 * 24 * 3);
            const template = verifyEmail_1.verifyEmailTemplate(constants_1.ORIGIN + "/verify-email?token=" + token);
            yield sendEmail_1.sendEmail(user === null || user === void 0 ? void 0 : user.email, template, "Verify your email - Quacker");
            return true;
        });
    }
    verifyEmail(token, { cache }) {
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
            const userId = yield cache.get(key);
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "The token is expired.",
                        },
                    ],
                };
            }
            const user = yield User_1.User.findOne(userId);
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
            yield cache.del(constants_1.VERIFY_EMAIL_PREFIX + token);
            return { user };
        });
    }
    forgotPassword(email, { cache }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            const key = constants_1.FORGOT_PASSWORD_PREFIX + token;
            yield cache.set(key, user.id, "ex", 1000 * 60 * 60 * 24);
            const template = forgotPassword_1.forgotPasswordTemplate(constants_1.ORIGIN + "/reset-password?token=" + token);
            yield sendEmail_1.sendEmail(user.email, template, "Reset your password - Quacker");
            return true;
        });
    }
    changePasswordWithToken(token, newPassword, { cache }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = new user_1.ValidateUser({ newPassword }).validate();
            if (errors.length !== 0) {
                return { errors };
            }
            const key = constants_1.FORGOT_PASSWORD_PREFIX + token;
            const userIdString = yield cache.get(key);
            if (!userIdString) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "Token expired.",
                        },
                    ],
                };
            }
            const userId = parseInt(userIdString);
            const user = yield User_1.User.findOne(userId);
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
            yield User_1.User.update({ id: userId }, { password: hashedPassword });
            yield cache.del(key);
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
    deactivate(password, { payload: { user } }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield argon2_1.default.verify(user.password, password)) {
                user.amIDeactivated = true;
                yield user.save();
                yield Quack_1.Quack.update({ quackedByUserId: user === null || user === void 0 ? void 0 : user.id }, { isVisible: false });
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
        return User_1.User.findOne({ email });
    }
    userByUsername(username) {
        return User_1.User.findOne({ username });
    }
};
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "followers", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
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
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followStatus", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean, { nullable: true }),
    type_graphql_1.Authorized(),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "followBackStatus", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserInput_1.UserInput, Object]),
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
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "verifyEmail", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
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
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map