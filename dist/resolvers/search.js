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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const User_1 = require("../entities/User");
const partialAuth_1 = require("../middleware/partialAuth");
const SearchResponse_1 = require("../response/SearchResponse");
const paginate_1 = require("../utils/paginate");
const searchQueryParser_1 = require("../utils/searchQueryParser");
let SearchResolver = class SearchResolver {
    search(query, type, fromFollowing = false, limit, lastIndex, { payload: { user }, blockLoaderByUserId, followLoaderByFollowerId, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const pq = new searchQueryParser_1.Parser(query).parsedSearchQuery;
            let myFollowingUserIds = [];
            if (fromFollowing) {
                if (!user) {
                    throw Error("Access denied! You need to be authorized to perform this action!");
                }
                myFollowingUserIds = (yield followLoaderByFollowerId.load(user.id)).map((follow) => follow.userId);
            }
            if (type === "quack") {
                const q = typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("q.*")
                    .from(Quack_1.Quack, "q")
                    .where(`q."isVisible" = true`);
                if (user) {
                    const ids = (yield blockLoaderByUserId.load(user.id)).map((block) => block.blockedByUserId);
                    if (ids.length > 0) {
                        q.andWhere(`q."quackedByUserId" not in (${ids.join(", ")})`);
                    }
                }
                if (fromFollowing) {
                    if (myFollowingUserIds.length === 0) {
                        return {
                            paginatedQuacks: {
                                quacks: null,
                                hasMore: false,
                            },
                        };
                    }
                    q.andWhere(`q."quackedByUserId" in (${myFollowingUserIds.join(", ")})`);
                }
                if ((_a = pq.words) === null || _a === void 0 ? void 0 : _a.like) {
                    q.andWhere(`q.text ~* '.*${pq.words.like}.*'`);
                }
                if (((_b = pq.words) === null || _b === void 0 ? void 0 : _b.notTheseWords) && ((_c = pq.words) === null || _c === void 0 ? void 0 : _c.notTheseWords.length) > 0) {
                    q.andWhere(`q.text !~* '(${pq.words.notTheseWords.join("|")})'`);
                }
                if ((_d = pq.words) === null || _d === void 0 ? void 0 : _d.exactPhrase) {
                    q.andWhere(`q.text ~* '${pq.words.exactPhrase}'`);
                }
                if (((_e = pq.words) === null || _e === void 0 ? void 0 : _e.hashtags) && pq.words.hashtags.length > 0) {
                    q.andWhere(`q.text ~* '(${pq.words.hashtags.join("|")})'`);
                }
                if (((_f = pq.words) === null || _f === void 0 ? void 0 : _f.or) && pq.words.or.length > 0) {
                    q.andWhere(`q.text ~* '(${pq.words.or.join("|")})'`);
                }
                if (((_g = pq.filters) === null || _g === void 0 ? void 0 : _g.filterOut) && pq.filters.filterOut.length > 0) {
                    pq.filters.filterOut.map((filter) => {
                        if (filter === "replies") {
                            q.andWhere(`q."inReplyToQuackId" is null`);
                        }
                        if (filter === "links") {
                            q.andWhere("q.text !~* '\\w+\\.\\w+'");
                        }
                    });
                }
                if (((_h = pq.filters) === null || _h === void 0 ? void 0 : _h.filterIn) && pq.filters.filterIn.length > 0) {
                    pq.filters.filterIn.map((filter) => {
                        if (filter === "replies") {
                            q.andWhere(`q."inReplyToQuackId" is not null`);
                        }
                        if (filter === "links") {
                            q.andWhere("q.text ~* '\\w+\\.\\w+'");
                        }
                    });
                }
                if (((_j = pq.accounts) === null || _j === void 0 ? void 0 : _j.fromTheseUsernames) &&
                    pq.accounts.fromTheseUsernames.length > 0) {
                    q.innerJoin(User_1.User, "fu", `fu.id = q."quackedByUserId"`);
                    q.andWhere(`fu.username ~* '(${pq.accounts.fromTheseUsernames.join("|")})'`);
                }
                if (((_k = pq.accounts) === null || _k === void 0 ? void 0 : _k.toTheseUsernames) &&
                    pq.accounts.toTheseUsernames.length > 0) {
                    q.andWhere(`q."inReplyToQuackId" is not null`)
                        .innerJoin(Quack_1.Quack, "rq", `rq.id = q."inReplyToQuackId"`)
                        .innerJoin(User_1.User, "tu", `tu.id = rq."quackedByUserId"`)
                        .andWhere(`tu.username ~* '(${pq.accounts.toTheseUsernames.join("|")})'`);
                }
                if (((_l = pq.accounts) === null || _l === void 0 ? void 0 : _l.mentions) && pq.accounts.mentions.length > 0) {
                    q.andWhere(`q.text ~* '(${pq.accounts.mentions.join("|")})'`);
                }
                if (((_m = pq.dates) === null || _m === void 0 ? void 0 : _m.sinceDate) && pq.dates.untilDate) {
                    q.andWhere(`q."createdAt" between '${pq.dates.sinceDate}' and '${pq.dates.untilDate}'`);
                }
                if (((_o = pq.dates) === null || _o === void 0 ? void 0 : _o.sinceDate) && !pq.dates.untilDate) {
                    q.andWhere(`q."createdAt" between '${pq.dates.sinceDate}' and current_date`);
                }
                if (!((_p = pq.dates) === null || _p === void 0 ? void 0 : _p.sinceDate) && ((_q = pq.dates) === null || _q === void 0 ? void 0 : _q.untilDate)) {
                    q.andWhere(`q."createdAt" between '1900-01-01' and '${pq.dates.untilDate}'`);
                }
                if (typeof ((_r = pq.engagement) === null || _r === void 0 ? void 0 : _r.minLikes) === "number" &&
                    pq.engagement.minLikes > 0) {
                    q.innerJoin(Like_1.Like, "lk", `lk."quackId" = q.id`)
                        .groupBy("q.id")
                        .andHaving(`count(lk.id) >= ${pq.engagement.minLikes}`);
                }
                if (typeof ((_s = pq.engagement) === null || _s === void 0 ? void 0 : _s.minRequacks) === "number" &&
                    pq.engagement.minRequacks > 0) {
                    q.innerJoin(Requack_1.Requack, "rqk", `rqk."quackId" = q.id`)
                        .groupBy("q.id")
                        .andHaving(`count(rqk.id) >= ${pq.engagement.minRequacks}`);
                }
                if (typeof ((_t = pq.engagement) === null || _t === void 0 ? void 0 : _t.minReplies) === "number" &&
                    pq.engagement.minReplies > 0) {
                    q.innerJoin(Quack_1.Quack, "rpl", `rpl."inReplyToQuackId" = q.id`)
                        .groupBy("q.id")
                        .andHaving(`count(rpl.id) >= ${pq.engagement.minReplies}`);
                }
                const { data: quacks, hasMore } = yield paginate_1.paginate({
                    queryBuilder: q,
                    limit,
                    index: "q.id",
                    lastIndex,
                });
                return {
                    paginatedQuacks: {
                        quacks,
                        hasMore,
                    },
                };
            }
            else if (type === "user") {
                const u = typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("u.*")
                    .from(User_1.User, "u")
                    .andWhere(`u."amIDeactivated" = false`)
                    .take(realLimitPlusOne)
                    .orderBy({ "u.id": "DESC" });
                if (lastIndex) {
                    u.andWhere(`u.id < ${lastIndex}`);
                }
                if (user) {
                    const ids = (yield blockLoaderByUserId.load(user.id)).map((block) => block.blockedByUserId);
                    if (ids.length > 0) {
                        u.andWhere(`q.id not in (${ids.join(", ")})`);
                    }
                }
                if (fromFollowing) {
                    if (myFollowingUserIds.length === 0) {
                        return {
                            paginatedUsers: {
                                users: null,
                                hasMore: false,
                            },
                        };
                    }
                    u.andWhere(`u.id in (${myFollowingUserIds.join(", ")})`);
                }
                if ((_u = pq.words) === null || _u === void 0 ? void 0 : _u.like) {
                    u.andWhere(`concat(u.username, ' ', u."displayName") ~* '.*${pq.words.like}.*'`);
                }
                if (((_v = pq.words) === null || _v === void 0 ? void 0 : _v.notTheseWords) && ((_w = pq.words) === null || _w === void 0 ? void 0 : _w.notTheseWords.length) > 0) {
                    u.andWhere(`concat(u.username, ' ', u."displayName") !~* '(${pq.words.notTheseWords.join("|")})'`);
                }
                if ((_x = pq.words) === null || _x === void 0 ? void 0 : _x.exactPhrase) {
                    u.andWhere(`concat(u.username, ' ', u."displayName") ~* '${pq.words.exactPhrase}'`);
                }
                if (((_y = pq.words) === null || _y === void 0 ? void 0 : _y.or) && pq.words.or.length > 0) {
                    u.andWhere(`concat(u.username, ' ', u."displayName") ~* '(${pq.words.or.join("|")})'`);
                }
                const { data: users, hasMore } = yield paginate_1.paginate({
                    queryBuilder: u,
                    limit,
                    index: "u.id",
                    lastIndex,
                });
                return {
                    paginatedUsers: {
                        users,
                        hasMore,
                    },
                };
            }
            return {};
        });
    }
};
__decorate([
    type_graphql_1.Query(() => SearchResponse_1.SearchResponse),
    type_graphql_1.UseMiddleware(partialAuth_1.partialAuth),
    __param(0, type_graphql_1.Arg("query")),
    __param(1, type_graphql_1.Arg("type", () => String, { nullable: true, defaultValue: "quack" })),
    __param(2, type_graphql_1.Arg("fromFollowing", () => Boolean, {
        nullable: true,
        defaultValue: false,
    })),
    __param(3, type_graphql_1.Arg("limit", () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(4, type_graphql_1.Arg("lastIndex", () => type_graphql_1.Int, { nullable: true, defaultValue: 0 })),
    __param(5, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SearchResolver.prototype, "search", null);
SearchResolver = __decorate([
    type_graphql_1.Resolver()
], SearchResolver);
exports.SearchResolver = SearchResolver;
//# sourceMappingURL=search.js.map