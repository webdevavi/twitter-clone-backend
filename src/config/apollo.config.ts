import { ApolloServerExpressConfig } from "apollo-server-express";
import { Redis } from "ioredis";
import { buildSchema } from "type-graphql";
import { BlockResolver } from "../resolvers/block";
import { FollowResolver } from "../resolvers/follow";
import { LikeResolver } from "../resolvers/like";
import { NewsResolver } from "../resolvers/news";
import { QuackResolver } from "../resolvers/quack";
import { RequackResolver } from "../resolvers/requack";
import { SearchResolver } from "../resolvers/search";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";
import { authChecker } from "../utils/authChecker";
import {
  blockLoader,
  blockLoaderByBlockedByUserId,
  blockLoaderByUserId,
} from "../utils/blockLoader";
import {
  followLoader,
  followLoaderByFollowerId,
  followLoaderByUserId,
} from "../utils/followLoader";
import {
  likeLoader,
  likeLoaderByQuackId,
  likeLoaderByUserId,
} from "../utils/likeLoader";
import { quackLoader } from "../utils/quackLoader";
import {
  requackLoader,
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "../utils/requackLoader";
import { userLoader } from "../utils/userLoader";

interface ApolloConfigOptions {
  redis: Redis;
}

export const apolloConfig = async ({
  redis,
}: ApolloConfigOptions): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({
    resolvers: [
      UserResolver,
      FollowResolver,
      QuackResolver,
      BlockResolver,
      RequackResolver,
      LikeResolver,
      NewsResolver,
      SearchResolver,
    ],
    validate: false,
    authChecker,
  }),

  context: ({ req, res }): MyContext => ({
    req,
    res,
    cache: redis,
    userLoader: userLoader(),
    quackLoader: quackLoader(),
    requackLoader: requackLoader(),
    requackLoaderByUserId: requackLoaderByUserId(),
    requackLoaderByQuackId: requackLoaderByQuackId(),
    likeLoader: likeLoader(),
    likeLoaderByQuackId: likeLoaderByQuackId(),
    likeLoaderByUserId: likeLoaderByUserId(),
    blockLoader: blockLoader(),
    blockLoaderByUserId: blockLoaderByUserId(),
    blockLoaderByBlockedByUserId: blockLoaderByBlockedByUserId(),
    followLoader: followLoader(),
    followLoaderByUserId: followLoaderByUserId(),
    followLoaderByFollowerId: followLoaderByFollowerId(),
    payload: {},
  }),
});
