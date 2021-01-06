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
exports.SearchResponse = void 0;
const type_graphql_1 = require("type-graphql");
const PaginatedQuacks_1 = require("./PaginatedQuacks");
const PaginatedUsers_1 = require("./PaginatedUsers");
let SearchResponse = class SearchResponse {
};
__decorate([
    type_graphql_1.Field(() => PaginatedUsers_1.PaginatedUsers, { nullable: true }),
    __metadata("design:type", Object)
], SearchResponse.prototype, "paginatedUsers", void 0);
__decorate([
    type_graphql_1.Field(() => PaginatedQuacks_1.PaginatedQuacks, { nullable: true }),
    __metadata("design:type", Object)
], SearchResponse.prototype, "paginatedQuacks", void 0);
SearchResponse = __decorate([
    type_graphql_1.ObjectType()
], SearchResponse);
exports.SearchResponse = SearchResponse;
//# sourceMappingURL=SearchResponse.js.map