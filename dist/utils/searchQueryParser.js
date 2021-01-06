"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const formatDate_1 = require("./formatDate");
const regexp_1 = require("./regexp");
class Parser {
    constructor(string) {
        this.string = string;
    }
    get parsedSearchQuery() {
        var _a, _b, _c, _d, _e, _f;
        return {
            filters: {
                filterOut: this.filterQuery(regexp_1.filterOut, (o) => {
                    var _a;
                    return (_a = o
                        .replace(/(\(|\)|-filter:)/gi, "")) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
                }),
                filterIn: this.filterQuery(regexp_1.filterIn, (o) => {
                    var _a;
                    return (_a = o
                        .replace(/(\(|\)|filter:)/gi, "")) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
                }),
            },
            accounts: {
                fromTheseUsernames: this.filterQuery(regexp_1.fromTheseUsernames, (o) => { var _a; return (_a = o.replace(/(\(|\)|from:)/gi, "")) === null || _a === void 0 ? void 0 : _a.trim(); }),
                toTheseUsernames: this.filterQuery(regexp_1.toTheseUsernames, (o) => { var _a; return (_a = o.replace(/(\(|\)|to:)/gi, "")) === null || _a === void 0 ? void 0 : _a.trim(); }),
                mentions: this.filterQuery(regexp_1.mentions, (o) => { var _a; return (_a = o.replace(/(\(|\))/gi, "")) === null || _a === void 0 ? void 0 : _a.trim(); }),
            },
            engagement: {
                minReplies: parseInt((_a = this.filterQuery(regexp_1.minReplies, (o) => o.replace(/(\(|\)|min_replies:)/gi, ""))[0]) === null || _a === void 0 ? void 0 : _a.trim()),
                minLikes: parseInt((_b = this.filterQuery(regexp_1.minLikes, (o) => o.replace(/(\(|\)|min_likes:)/gi, ""))[0]) === null || _b === void 0 ? void 0 : _b.trim()),
                minRequacks: parseInt((_c = this.filterQuery(regexp_1.minRequacks, (o) => o.replace(/(\(|\)|min_requacks:)/gi, ""))[0]) === null || _c === void 0 ? void 0 : _c.trim()),
            },
            dates: {
                sinceDate: formatDate_1.formatDate(new Date((_d = this.filterQuery(regexp_1.sinceDate, (o) => o.replace(/(\(|\)|since:)/gi, ""))[0]) === null || _d === void 0 ? void 0 : _d.trim())) || undefined,
                untilDate: formatDate_1.formatDate(new Date((_e = this.filterQuery(regexp_1.untilDate, (o) => o.replace(/(\(|\)|until:)/gi, ""))[0]) === null || _e === void 0 ? void 0 : _e.trim())) || undefined,
            },
            words: {
                exactPhrase: (_f = this.filterQuery(regexp_1.exactPhrase, (o) => o.replace(/(\(|\)|")/g, ""))[0]) === null || _f === void 0 ? void 0 : _f.trim(),
                or: this.filterQuery(regexp_1.or, (o) => {
                    return o
                        .replace(/(\(|\))/g, "")
                        .replace(/\s{1,}or\s{1,}/gi, " ")
                        .replace(/\s+/g, " ")
                        .split(" ")
                        .map((i) => i.trim());
                })
                    .flat(999)
                    .filter((o) => o.length > 0),
                notTheseWords: this.filterQuery(regexp_1.notTheseWords, (o) => { var _a; return (_a = o.replace(/(\(|\)|-)/gi, "")) === null || _a === void 0 ? void 0 : _a.trim(); }),
                hashtags: this.filterQuery(regexp_1.hashtags, (o) => { var _a; return (_a = o.replace(/(\(|\))/gi, "")) === null || _a === void 0 ? void 0 : _a.trim(); }),
                like: this.string
                    .replace(/('|\*|"|\(|\))/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase(),
            },
        };
    }
    filterQuery(regex, next) {
        const matches = [...this.string.matchAll(regex)].map((match) => match[0]);
        return matches.map((o) => {
            this.string = this.string.replace(RegExp(this.escapeBrackets(o), "g"), "");
            return next(o);
        });
    }
    escapeBrackets(o) {
        return o.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    }
}
exports.Parser = Parser;
//# sourceMappingURL=searchQueryParser.js.map