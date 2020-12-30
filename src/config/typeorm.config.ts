import { createConnection } from "typeorm";
import {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
  __prod__,
} from "../constants";
import { Block } from "../entities/Block";
import { Cache } from "../entities/Cache";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";

const conditionalProps = __prod__
  ? { url: DATABASE_URL }
  : {
      database: DATABASE_NAME as string,
      username: DATABASE_USER as string,
      password: DATABASE_PASSWORD as string,
    };

export const typeormConfig = {
  ...conditionalProps,
  type: "postgres",
  logging: true,
  synchronize: true,
  entities: [Quack, User, Follow, Requack, Like, Block, Cache],
} as Parameters<typeof createConnection>[0];
