import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MyContext } from "../types";

export const apolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({
    resolvers: [] as any,
    validate: false,
  }),
  context: ({ req, res }): MyContext => ({ req, res }),
});
