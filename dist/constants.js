"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORGOT_PASSWORD_PREFIX = exports.VERIFY_EMAIL_PREFIX = exports.COOKIE_NAME = exports.SESSION_SECRET = exports.PORT = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.DATABASE_NAME = exports.DATABASE_URL = exports.ORIGIN = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === "production";
if (!exports.__prod__) {
    require("dotenv").config();
}
exports.ORIGIN = process.env.ORIGIN;
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.DATABASE_NAME = process.env.DATABASE_NAME;
exports.DATABASE_USER = process.env.DATABASE_USER;
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
exports.PORT = process.env.PORT || 2608;
exports.SESSION_SECRET = process.env.SESSION_SECRET;
exports.COOKIE_NAME = process.env.COOKIE_NAME || "qid";
exports.VERIFY_EMAIL_PREFIX = process.env.VERIFY_EMAIL_PREFIX || "verify-email:";
exports.FORGOT_PASSWORD_PREFIX = process.env.FORGOT_PASSWORD_PREFIX || "forgot-password:";
//# sourceMappingURL=constants.js.map