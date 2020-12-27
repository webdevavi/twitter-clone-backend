import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BlockResolver } from "../resolvers/block";
import { FollowResolver } from "../resolvers/follow";
import { QuackResolver } from "../resolvers/quack";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";

export const apolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({
    resolvers: [UserResolver, FollowResolver, QuackResolver, BlockResolver],
    validate: false,
  }),
  context: ({ req, res }): MyContext => ({ req, res }),
});
