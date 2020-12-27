"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionConfig = void 0;
const out_1 = require("connect-typeorm/out");
const constants_1 = require("../constants");
const sessionConfig = (sessionRepository) => ({
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
    store: new out_1.TypeormStore({
        cleanupLimit: 2,
        ttl: 86400,
    }).connect(sessionRepository),
});
exports.sessionConfig = sessionConfig;
//# sourceMappingURL=session.config.js.map