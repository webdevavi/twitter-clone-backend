"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NYTIMES_API_KEY = exports.NYTIMES_ENDPOINT = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.DEFAULT_CP = exports.DEFAULT_DP = exports.REFRESH_TOKEN = exports.ACCESS_TOKEN = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.DATABASE_NAME = exports.DATABASE_URL = exports.ENDPOINT = exports.ORIGIN = exports.PORT = exports.__prod__ = void 0;
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
exports.ACCESS_TOKEN = process.env.ACCESS_TOKEN || "qat";
exports.REFRESH_TOKEN = process.env.REFRESH_TOKEN || "qrt";
exports.DEFAULT_DP = "https://picsum.photos/400";
exports.DEFAULT_CP = "https://picsum.photos/1200";
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.NYTIMES_ENDPOINT = process.env.NYTIMES_ENDPOINT;
exports.NYTIMES_API_KEY = process.env.NYTIMES_API_KEY;
//# sourceMappingURL=constants.js.map