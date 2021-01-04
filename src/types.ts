import { Request, Response } from "express";
import { Redis } from "ioredis";
import { User } from "./entities/User";
import {
  blockLoader,
  blockLoaderByBlockedByUserId,
  blockLoaderByUserId,
} from "./utils/blockLoader";
import {
  followLoader,
  followLoaderByFollowerId,
  followLoaderByUserId,
} from "./utils/followLoader";
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
  blockLoader: ReturnType<typeof blockLoader>;
  blockLoaderByUserId: ReturnType<typeof blockLoaderByUserId>;
  blockLoaderByBlockedByUserId: ReturnType<typeof blockLoaderByBlockedByUserId>;
  followLoader: ReturnType<typeof followLoader>;
  followLoaderByUserId: ReturnType<typeof followLoaderByUserId>;
  followLoaderByFollowerId: ReturnType<typeof followLoaderByFollowerId>;
  payload: ContextPayload;
};

export type ContextPayload = {
  user?: User;
};

export type JWTPayload = {
  userId: number;
};

export type UserRole = "ACTIVATED" | "DEACTIVATED" | "VERIFIED" | "UNVERIFIED";

export type NewsSection =
  | "world"
  | "science"
  | "health"
  | "sports"
  | "business"
  | "movies";
