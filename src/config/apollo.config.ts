import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "../resolvers/user";
import { MyContext } from "../types";

export const apolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({
    resolvers: [UserResolver],
    validate: false,
  }),
  context: ({ req, res }): MyContext => ({ req, res }),
});
