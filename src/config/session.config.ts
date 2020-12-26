import session from "express-session";
import { COOKIE_NAME, SESSION_SECRET } from "../constants";

export const sessionConfig = {
  name: COOKIE_NAME,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },
  secret: SESSION_SECRET || "",
  resave: false,
} as Parameters<typeof session>[0];
