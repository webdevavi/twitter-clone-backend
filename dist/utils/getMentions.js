"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMentions = void 0;
const regexp_1 = require("./regexp");
const getMentions = (text, prefix = true) => {
    const mentions = new Set();
    const matches = [...text.matchAll(regexp_1.mentions)].map((match) => match[0]);
    matches.map((match) => {
        if (prefix) {
            return mentions.add(match);
        }
        return mentions.add(match.replace(/@/g, ""));
    });
    return [...mentions];
};
exports.getMentions = getMentions;
//# sourceMappingURL=getMentions.js.map