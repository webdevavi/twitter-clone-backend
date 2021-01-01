import { ApolloServerExpressConfig } from "apollo-server-express";
import { authChecker } from "../utils/authChecker";
import { buildSchema } from "type-graphql";
import { BlockResolver } from "../resolvers/block";
import { FollowResolver } from "../resolvers/follow";
import { LikeResolver } from "../resolvers/like";
import { QuackResolver } from "../resolvers/quack";
import { RequackResolver } from "../resolvers/requack";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";
import {
  likeLoader,
  likeLoaderByQuackId,
  likeLoaderByUserId,
} from "../utils/likeLoader";
import {
  requackLoader,
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "../utils/requackLoader";
import { userLoader } from "../utils/userLoader";
import { Redis } from "ioredis";

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
    ],
    validate: false,
    authChecker,
  }),

  context: ({ req, res }): MyContext => ({
    req,
    res,
    cache: redis,
    userLoader: userLoader(),
    requackLoader: requackLoader(),
    requackLoaderByUserId: requackLoaderByUserId(),
    requackLoaderByQuackId: requackLoaderByQuackId(),
    likeLoader: likeLoader(),
    likeLoaderByQuackId: likeLoaderByQuackId(),
    likeLoaderByUserId: likeLoaderByUserId(),
    payload: {},
  }),
});
