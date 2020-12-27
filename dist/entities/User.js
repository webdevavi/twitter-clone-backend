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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const Follow_1 = require("./Follow");
const Like_1 = require("./Like");
const Quack_1 = require("./Quack");
const Requack_1 = require("./Requack");
let User = User_1 = class User extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.displayPicture = constants_1.DEFAULT_DP;
        this.coverPicture = constants_1.DEFAULT_CP;
        this.emailVerified = false;
        this.amIDeactivated = false;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    typeorm_1.Column(),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column({ default: constants_1.DEFAULT_DP }),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "displayPicture", void 0);
__decorate([
    typeorm_1.Column({ default: constants_1.DEFAULT_CP }),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "coverPicture", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ type: "boolean", default: false }),
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    typeorm_1.Column({ type: "boolean", default: false }),
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], User.prototype, "amIDeactivated", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.OneToMany(() => Quack_1.Quack, (quack) => quack.quackedByUser, { nullable: true }),
    type_graphql_1.Field(() => [Quack_1.Quack], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "quacks", void 0);
__decorate([
    typeorm_1.OneToMany(() => Requack_1.Requack, (requack) => requack.user, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [Requack_1.Requack], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "requacks", void 0);
__decorate([
    typeorm_1.OneToMany(() => Like_1.Like, (like) => like.user, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [Like_1.Like], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "likes", void 0);
__decorate([
    typeorm_1.OneToMany(() => Follow_1.Follow, (follow) => follow.user, {
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [User_1], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "followers", void 0);
__decorate([
    typeorm_1.OneToMany(() => Follow_1.Follow, (follow) => follow.follower, {
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [User_1], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "followings", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "haveIBlockedThisUser", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "amIBlockedByThisUser", void 0);
User = User_1 = __decorate([
    typeorm_1.Entity(),
    type_graphql_1.ObjectType()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map