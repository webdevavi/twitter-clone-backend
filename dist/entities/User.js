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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const Block_1 = require("./Block");
const Follow_1 = require("./Follow");
const Like_1 = require("./Like");
const Quack_1 = require("./Quack");
const Requack_1 = require("./Requack");
let User = class User extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.displayPicture = constants_1.DEFAULT_DP;
        this.coverPicture = constants_1.DEFAULT_CP;
        this.isVerified = false;
        this.quacks = 0;
        this.followers = 0;
        this.followings = 0;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
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
    __metadata("design:type", String)
], User.prototype, "rawUsername", void 0);
__decorate([
    typeorm_1.Column(),
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
], User.prototype, "isVerified", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], User.prototype, "quacks", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Quack_1.Quack, (quack) => quack.quackedByUserId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_quacks", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Like_1.Like, (like) => like.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_likes", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Requack_1.Requack, (requack) => requack.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_requacks", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], User.prototype, "followers", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Follow_1.Follow, (follow) => follow.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_followers", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], User.prototype, "followings", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Follow_1.Follow, (follow) => follow.followerId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_followings", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "haveIBlockedThisUser", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "amIBlockedByThisUser", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "followStatus", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "followBackStatus", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Block_1.Block, (block) => block.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_blockedBys", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Block_1.Block, (block) => block.blockedByUserId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "_blocks", void 0);
User = __decorate([
    typeorm_1.Entity(),
    type_graphql_1.ObjectType()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map