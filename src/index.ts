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
import { PORT } from "./constants";

const main = async () => {
  await createConnection(typeormConfig);

  const app = express();

  app.use(session(sessionConfig));

  app.use(cors(corsConfig));

  const apolloServer = new ApolloServer(await apolloConfig());

  apolloServer.applyMiddleware({
    app,
    cors: true,
  });

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

main().catch((error) => console.log(error));
