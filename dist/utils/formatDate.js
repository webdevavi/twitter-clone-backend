"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = void 0;
const formatDate = (date) => {
    try {
        const offset = date.getTimezoneOffset();
        date = new Date(date.getTime() - offset * 60 * 1000);
        return date.toISOString().split("T")[0];
    }
    catch (err) {
        return null;
    }
};
exports.formatDate = formatDate;
//# sourceMappingURL=formatDate.js.map