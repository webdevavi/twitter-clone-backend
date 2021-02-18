import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { apolloConfig, corsConfig, typeormConfig } from "./config";
import { PORT, __prod__ } from "./constants";
import { router } from "./rest";

const main = async () => {
  await createConnection(typeormConfig());
  const app = express();

  app.use(cors(corsConfig));

  app.use(express.json());

  app.use(router);

  const apolloServer = new ApolloServer(await apolloConfig());

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(PORT, () => {
    console.log(`The server has started on port ${PORT}.`);
    if (!__prod__) {
      const url = `http://localhost:${PORT}/graphql`;
      console.log(`You can debug the graphql server at ${url}`);
      // require("open")(url);
    }
  });
};

main().catch((error) => console.log(error));
