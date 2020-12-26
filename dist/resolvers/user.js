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
const constants_1 = require("../constants");
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const UserResponse_1 = require("../entities/UserResponse");
const UserInput_1 = require("../input/UserInput");
const regexp_1 = require("../utils/regexp");
const user_1 = require("../validators/user");
const sendEmail_1 = require("../utils/sendEmail");
const verifyEmail_1 = require("../emailTemplates/verifyEmail");
const uuid_1 = require("uuid");
const Cache_1 = require("../entities/Cache");
const isAuth_1 = require("../middleware/isAuth");
const forgotPassword_1 = require("../emailTemplates/forgotPassword");
const Follow_1 = require("../entities/Follow");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const Like_1 = require("../entities/Like");
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
        return Quack_1.Quack.find({ where: { quackedByUserId: user.id } });
    }
    requacks(user) {
        return Requack_1.Requack.find({ where: { userId: user.id } });
    }
    likes(user) {
        return Like_1.Like.find({ where: { userId: user.id } });
    }
    signup(input, { req }) {
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
                req.session.userId = user.id;
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
                    else {
                        throw error;
                    }
                }
            }
            return { user };
        });
    }
    login(emailOrUsername, password, { req }) {
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
                req.session.userId = user.id;
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
    sendEmailVerificationLink({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(req.session.userId);
            if (!user) {
                throw Error("User not found");
            }
            if (user.emailVerified) {
                return false;
            }
            const cache = yield Cache_1.Cache.findOne({ where: { value: user.id } });
            let token;
            if (cache) {
                token = cache.key.slice(constants_1.VERIFY_EMAIL_PREFIX.length);
            }
            else {
                token = uuid_1.v4();
                yield Cache_1.Cache.insert({ key: constants_1.VERIFY_EMAIL_PREFIX + token, value: user.id });
            }
            const template = verifyEmail_1.verifyEmailTemplate(constants_1.ORIGIN + "/verify-email?token=" + token);
            yield sendEmail_1.sendEmail(user.email, template, "Verify your email - Quacker");
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
            yield User_1.User.update({ id: cache.value }, {
                emailVerified: true,
            });
            user.emailVerified = true;
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
    changePassword(token, newPassword, { req }) {
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
            req.session.userId = user.id;
            yield Cache_1.Cache.delete(key);
            return { user };
        });
    }
    me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne(req.session.userId);
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
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "quacks", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "requacks", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "likes", null);
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
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
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
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map