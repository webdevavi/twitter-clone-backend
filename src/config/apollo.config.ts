import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BlockResolver } from "../resolvers/block";
import { FollowResolver } from "../resolvers/follow";
import { QuackResolver } from "../resolvers/quack";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";
import { likeLoaderByQuackId, likeLoaderByUserId } from "../utils/likeLoader";
import {
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "../utils/requackLoader";
import { userLoader } from "../utils/userLoader";

export const apolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({
    resolvers: [UserResolver, FollowResolver, QuackResolver, BlockResolver],
    validate: false,
  }),
  context: ({ req, res }): MyContext => ({
    req,
    res,
    userLoader: userLoader(),
    requackLoaderByUserId: requackLoaderByUserId(),
    requackLoaderByQuackId: requackLoaderByQuackId(),
    likeLoaderByQuackId: likeLoaderByQuackId(),
    likeLoaderByUserId: likeLoaderByUserId(),
  }),
});
