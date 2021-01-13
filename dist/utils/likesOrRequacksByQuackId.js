"use strict";
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
exports.likesOrRequacksByQuackId = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const paginate_1 = require("./paginate");
function likesOrRequacksByQuackId({ quackId, loaderByQuackId, blockLoaderByUserId, user, limit, lastIndex, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const likesOrReusers = yield loaderByQuackId.load(quackId);
        if (!likesOrReusers || likesOrReusers.length < 1) {
            return { users: [], hasMore: false };
        }
        const userIds = likesOrReusers.map((likeOrRequack) => likeOrRequack.userId);
        const u = typeorm_1.getConnection()
            .createQueryBuilder()
            .select("u.*")
            .from(User_1.User, "u")
            .orderBy({ "u.id": "DESC" }).where(`
        u.id in (${userIds.join(",")})
      `);
        if (user) {
            const blockIds = (yield blockLoaderByUserId.load(user.id)).map((block) => block.blockedByUserId);
            if (blockIds && blockIds.length > 0) {
                u.andWhere(`
        u.id not in (${blockIds.join(",")})
    `);
            }
        }
        const { data: users, hasMore } = yield paginate_1.paginate({
            queryBuilder: u,
            limit,
            index: "u.id",
            lastIndex,
        });
        return {
            users,
            hasMore,
        };
    });
}
exports.likesOrRequacksByQuackId = likesOrRequacksByQuackId;
//# sourceMappingURL=likesOrRequacksByQuackId.js.map