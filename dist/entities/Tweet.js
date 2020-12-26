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
exports.Tweet = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let Tweet = class Tweet extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn({ type: "uuid" }),
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Tweet.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: "text" }),
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Tweet.prototype, "text", void 0);
Tweet = __decorate([
    typeorm_1.Entity(),
    type_graphql_1.ObjectType()
], Tweet);
exports.Tweet = Tweet;
//# sourceMappingURL=Tweet.js.map