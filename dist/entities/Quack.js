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
const Requack_1 = require("./Requack");
const User_1 = require("./User");
const Like_1 = require("./Like");
let Quack = Quack_1 = class Quack extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Quack.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], Quack.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column(),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Quack.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], Quack.prototype, "urls", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], Quack.prototype, "images", void 0);
__decorate([
    typeorm_1.Column(),
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Quack.prototype, "quackedByUserId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.quacks, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Quack.prototype, "quackedByUser", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], Quack.prototype, "inReplyToQuackId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Quack_1, (quack) => quack.replies, { nullable: true }),
    __metadata("design:type", Quack)
], Quack.prototype, "inReplyToQuack", void 0);
__decorate([
    typeorm_1.OneToMany(() => Quack_1, (quack) => quack.inReplyToQuack, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [Quack_1], { nullable: true }),
    __metadata("design:type", Array)
], Quack.prototype, "replies", void 0);
__decorate([
    typeorm_1.OneToMany(() => Requack_1.Requack, (requacks) => requacks.quack, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [Requack_1.Requack]),
    __metadata("design:type", Array)
], Quack.prototype, "requacks", void 0);
__decorate([
    typeorm_1.OneToMany(() => Like_1.Like, (like) => like.quack, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    type_graphql_1.Field(() => [Like_1.Like]),
    __metadata("design:type", Array)
], Quack.prototype, "likes", void 0);
Quack = Quack_1 = __decorate([
    typeorm_1.Entity(),
    type_graphql_1.ObjectType()
], Quack);
exports.Quack = Quack;
//# sourceMappingURL=Quack.js.map