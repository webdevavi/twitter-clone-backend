import { ApolloServerExpressConfig } from "apollo-server-express";
import { Redis } from "ioredis";
import { buildSchema } from "type-graphql";
import { BlockResolver } from "../resolvers/block";
import { FollowResolver } from "../resolvers/follow";
import { LikeResolver } from "../resolvers/like";
import { NewsResolver } from "../resolvers/news";
import { QuackResolver } from "../resolvers/quack";
import { RequackResolver } from "../resolvers/requack";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";
import { authChecker } from "../utils/authChecker";
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
