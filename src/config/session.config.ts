import { TypeormStore } from "connect-typeorm/out";
import session from "express-session";
import { Repository } from "typeorm";
import { COOKIE_NAME, SESSION_SECRET } from "../constants";
import { Session } from "../entities/Session";

export const sessionConfig = (sessionRepository: Repository<Session>) =>
  ({
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
    store: new TypeormStore({
      cleanupLimit: 2,
      ttl: 86400,
    }).connect(sessionRepository),
  } as Parameters<typeof session>[0]);
