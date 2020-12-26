"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validUrl = exports.validEmail = exports.containsSpecialCharacters = void 0;
exports.containsSpecialCharacters = /[-/:-@[-`{-~]/;
exports.validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
exports.validUrl = /^(ftp|http|https):\/\/[^ "]+$/;
//# sourceMappingURL=regexp.js.map