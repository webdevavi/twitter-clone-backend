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
var Quack_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quack = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Like_1 = require("./Like");
const Link_1 = require("./Link");
const Requack_1 = require("./Requack");
const User_1 = require("./User");
let Quack = Quack_1 = class Quack extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.isVisible = true;
        this.replies = 0;
        this.requacks = 0;
        this.likes = 0;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], Quack.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], Quack.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ type: "boolean", default: true }),
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], Quack.prototype, "isVisible", void 0);
__decorate([
    typeorm_1.Column(),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Quack.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], Quack.prototype, "truncatedText", void 0);
__decorate([
    type_graphql_1.Field(() => [Link_1.Link], { nullable: true }),
    __metadata("design:type", Object)
], Quack.prototype, "links", void 0);
__decorate([
    type_graphql_1.Field(() => [User_1.User], { nullable: true }),
    __metadata("design:type", Object)
], Quack.prototype, "mentions", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Object)
], Quack.prototype, "hashtags", void 0);
__decorate([
    typeorm_1.Column(),
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], Quack.prototype, "quackedByUserId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.quacks),
    type_graphql_1.Field(() => User_1.User),
    __metadata("design:type", User_1.User)
], Quack.prototype, "quackedByUser", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], Quack.prototype, "inReplyToQuackId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Quack_1, (quack) => quack.replies, {
        onDelete: "SET NULL",
        nullable: true,
    }),
    type_graphql_1.Field(() => Quack_1, { nullable: true }),
    __metadata("design:type", Quack)
], Quack.prototype, "inReplyToQuack", void 0);
__decorate([
    typeorm_1.OneToMany(() => Quack_1, (quack) => quack.inReplyToQuack, {
        nullable: true,
    }),
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], Quack.prototype, "replies", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], Quack.prototype, "requacks", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], Quack.prototype, "likes", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Like_1.Like, (like) => like.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], Quack.prototype, "_likes", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Requack_1.Requack, (requack) => requack.userId, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], Quack.prototype, "_requacks", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], Quack.prototype, "requackStatus", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], Quack.prototype, "likeStatus", void 0);
Quack = Quack_1 = __decorate([
    typeorm_1.Entity(),
    type_graphql_1.ObjectType()
], Quack);
exports.Quack = Quack;
//# sourceMappingURL=Quack.js.map