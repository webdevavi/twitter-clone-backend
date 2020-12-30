import { createConnection } from "typeorm";
import {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "../constants";
import { Block } from "../entities/Block";
import { Cache } from "../entities/Cache";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";

export const typeormConfig = {
  url: DATABASE_URL,
  type: "postgres",
  database: DATABASE_NAME as string,
  username: DATABASE_USER as string,
  password: DATABASE_PASSWORD as string,
  logging: true,
  synchronize: true,
  entities: [Quack, User, Follow, Requack, Like, Block, Cache],
} as Parameters<typeof createConnection>[0];
