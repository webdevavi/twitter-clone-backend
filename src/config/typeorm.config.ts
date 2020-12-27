import { createConnection } from "typeorm";
import {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "../constants";
import { Cache } from "../entities/Cache";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Requack } from "../entities/Requack";
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { Block } from "../entities/Block";
import { Session } from "../entities/Session";

export const typeormConfig = {
  url: DATABASE_URL,
  type: "postgres",
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  logging: true,
  synchronize: true,
  entities: [Quack, User, Follow, Requack, Like, Block, Cache, Session],
} as Parameters<typeof createConnection>[0];
