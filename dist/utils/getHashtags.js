"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashtags = void 0;
const regexp_1 = require("./regexp");
const getHashtags = (text, prefix = true) => {
    const hashtags = new Set();
    const matches = [...text.matchAll(regexp_1.hashtags)].map((match) => match[0]);
    matches.map((match) => {
        if (prefix) {
            return hashtags.add(match);
        }
        return hashtags.add(match.replace(/#/g, ""));
    });
    return [...hashtags];
};
exports.getHashtags = getHashtags;
//# sourceMappingURL=getHashtags.js.map