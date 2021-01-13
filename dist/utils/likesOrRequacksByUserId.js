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
exports.likesOrRequacksByUserId = void 0;
const typeorm_1 = require("typeorm");
const Quack_1 = require("../entities/Quack");
const paginate_1 = require("./paginate");
function likesOrRequacksByUserId({ userId, loaderByUserId, blockLoaderByUserId, user, limit, lastIndex, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const likesOrRequacks = yield loaderByUserId.load(userId);
        if (!likesOrRequacks || likesOrRequacks.length < 1) {
            return { quacks: [], hasMore: false };
        }
        const quackIds = likesOrRequacks.map((likeOrRequack) => likeOrRequack.quackId);
        const q = typeorm_1.getConnection()
            .createQueryBuilder()
            .select("q.*")
            .from(Quack_1.Quack, "q")
            .where(`q."isVisible" = true`).where(`
        q.id in (${quackIds.join(",")})
      `);
        if (user) {
            const blockIds = (yield blockLoaderByUserId.load(user.id)).map((block) => block.blockedByUserId);
            if (blockIds && blockIds.length > 0) {
                q.andWhere(`
          q."quackedByUserId" not in (${blockIds.join(",")})
          `);
            }
        }
        const { data: quacks, hasMore } = yield paginate_1.paginate({
            queryBuilder: q,
            limit,
            index: "q.id",
            lastIndex,
        });
        return {
            quacks,
            hasMore,
        };
    });
}
exports.likesOrRequacksByUserId = likesOrRequacksByUserId;
//# sourceMappingURL=likesOrRequacksByUserId.js.map