// import { ApolloServer } from "apollo-server-express";
// import cors from "cors";
import express from "express";
// import "reflect-metadata";
// import { createConnection } from "typeorm";
// import { apolloConfig, corsConfig, typeormConfig } from "./config";
import { PORT, __prod__ } from "./constants";
// import { router } from "./rest";

const main = async () => {
  // await createConnection(typeormConfig);
  const app = express();

  app.get(
    ".well-known/acme-challenge/VeX5Ry7AHsmfkmh4zvwzM5QkzNkxG481uZtxAXvMxV4",
    (_, res) =>
      res.send(
        "VeX5Ry7AHsmfkmh4zvwzM5QkzNkxG481uZtxAXvMxV4.8OagZ1r5d5ryybc2ain9wkfU-s-9M8T4zELxEtMscQI"
      )
  );

  // app.use(cors(corsConfig));

  // app.use(router);

  // const apolloServer = new ApolloServer(await apolloConfig());

  // apolloServer.applyMiddleware({
  //   app,
  //   cors: false,
  // });

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
