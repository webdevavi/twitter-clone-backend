"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.DEFAULT_CP = exports.DEFAULT_DP = exports.FORGOT_PASSWORD_PREFIX = exports.VERIFY_EMAIL_PREFIX = exports.REFRESH_TOKEN = exports.ACCESS_TOKEN = exports.NODE_MAILER_PASSWORD = exports.NODE_MAILER_USER = exports.NODE_MAILER_PORT = exports.NODE_MAILER_HOST = exports.REDIS_PASSWORD = exports.REDIS_URL = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.DATABASE_NAME = exports.DATABASE_URL = exports.ENDPOINT = exports.ORIGIN = exports.PORT = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === "production";
if (!exports.__prod__) {
    require("dotenv").config();
}
exports.PORT = process.env.PORT || 2608;
exports.ORIGIN = process.env.ORIGIN || "http://localhost:3000";
exports.ENDPOINT = process.env.ENDPOINT || "http://localhost:" + exports.PORT;
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.DATABASE_NAME = process.env.DATABASE_NAME;
exports.DATABASE_USER = process.env.DATABASE_USER;
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
exports.REDIS_URL = process.env.REDIS_URL;
exports.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
exports.NODE_MAILER_HOST = process.env.NODE_MAILER_HOST;
exports.NODE_MAILER_PORT = process.env.NODE_MAILER_PORT;
exports.NODE_MAILER_USER = process.env.NODE_MAILER_USER;
exports.NODE_MAILER_PASSWORD = process.env.NODE_MAILER_PASSWORD;
exports.ACCESS_TOKEN = process.env.ACCESS_TOKEN || "qat";
exports.REFRESH_TOKEN = process.env.REFRESH_TOKEN || "qrt";
exports.VERIFY_EMAIL_PREFIX = process.env.VERIFY_EMAIL_PREFIX || "verify-email:";
exports.FORGOT_PASSWORD_PREFIX = process.env.FORGOT_PASSWORD_PREFIX || "forgot-password:";
exports.DEFAULT_DP = "https://picsum.photos/400";
exports.DEFAULT_CP = "https://picsum.photos/1200";
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
//# sourceMappingURL=constants.js.map