import {
  likeLoader,
  likeLoaderByQuackId,
  likeLoaderByUserId,
} from "./utils/likeLoader";
import {
  requackLoader,
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "./utils/requackLoader";
import { userLoader } from "./utils/userLoader";
import { Request, Response } from "express";
import { User } from "./entities/User";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request;
  res: Response;
  cache: Redis;
  userLoader: ReturnType<typeof userLoader>;
  requackLoader: ReturnType<typeof requackLoader>;
  requackLoaderByQuackId: ReturnType<typeof requackLoaderByQuackId>;
  requackLoaderByUserId: ReturnType<typeof requackLoaderByUserId>;
  likeLoader: ReturnType<typeof likeLoader>;
  likeLoaderByQuackId: ReturnType<typeof likeLoaderByQuackId>;
  likeLoaderByUserId: ReturnType<typeof likeLoaderByUserId>;
  payload: ContextPayload;
};

export type ContextPayload = {
  user?: User;
};

export type JWTPayload = {
  userId: string;
};

export type UserRole = "ACTIVATED" | "DEACTIVATED" | "VERIFIED" | "UNVERIFIED";
