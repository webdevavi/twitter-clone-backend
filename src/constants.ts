export const __prod__ = process.env.NODE_ENV === "production";

if (!__prod__) {
  require("dotenv").config();
}

export const ORIGIN = process.env.ORIGIN;

export const DATABASE_URL = process.env.DATABASE_URL;
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const DATABASE_USER = process.env.DATABASE_USER;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

export const PORT = process.env.PORT || 2608;

export const SESSION_SECRET = process.env.SESSION_SECRET;

export const COOKIE_NAME = process.env.COOKIE_NAME || "qid";

export const VERIFY_EMAIL_PREFIX =
  process.env.VERIFY_EMAIL_PREFIX || "verify-email:";
export const FORGOT_PASSWORD_PREFIX =
  process.env.FORGOT_PASSWORD_PREFIX || "forgot-password:";
