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
exports.paginate = void 0;
function paginate({ queryBuilder, limit = 20, index, lastIndex, max = 50, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const realLimit = Math.min(max, limit);
        const realLimitPlusOne = realLimit + 1;
        queryBuilder.take(realLimitPlusOne).orderBy({ [index]: "DESC" });
        if (lastIndex) {
            queryBuilder.andWhere(`${index} < ${lastIndex}`);
        }
        const data = (yield queryBuilder.execute());
        return {
            data: data === null || data === void 0 ? void 0 : data.slice(0, realLimit),
            hasMore: (data === null || data === void 0 ? void 0 : data.length) === realLimitPlusOne,
        };
    });
}
exports.paginate = paginate;
//# sourceMappingURL=paginate.js.map