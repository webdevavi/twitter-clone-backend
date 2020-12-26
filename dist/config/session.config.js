"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionConfig = void 0;
const constants_1 = require("../constants");
exports.sessionConfig = {
    name: constants_1.COOKIE_NAME,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    },
    secret: constants_1.SESSION_SECRET || "",
    resave: false,
};
//# sourceMappingURL=session.config.js.map