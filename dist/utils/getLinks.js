"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinks = void 0;
const regexp_1 = require("./regexp");
const getLinks = (text) => {
    const links = new Set();
    const matches = [...text.matchAll(regexp_1.validUrl)].map((match) => match[0]);
    matches.map((match) => links.add(match));
    return [...links];
};
exports.getLinks = getLinks;
//# sourceMappingURL=getLinks.js.map