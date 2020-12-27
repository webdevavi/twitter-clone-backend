import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import session from "express-session";
import { createConnection } from "typeorm";
import {
  apolloConfig,
  corsConfig,
  sessionConfig,
  typeormConfig,
} from "./config";
import { PORT, __prod__ } from "./constants";
import { Session } from "./entities/Session";

const main = async () => {
  const connection = await createConnection(typeormConfig);
  const app = express();

  const sessionRepository = connection.getRepository(Session);

  app.use(session(sessionConfig(sessionRepository)));

  app.use(cors(corsConfig));

  const apolloServer = new ApolloServer(await apolloConfig());

  apolloServer.applyMiddleware({
    app,
    cors: true,
  });

  app.listen(PORT, () => {
    console.log(`The server has started on port ${PORT}.`);
    if (!__prod__) {
      const url = `http://localhost:${PORT}/graphql`;
      console.log(`You can debug the graphql server at ${url}`);
      require("open")(url);
    }
  });
};

main().catch((error) => console.log(error));
