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

type TypeormConfig = Parameters<typeof createConnection>[0];

export const typeormConfig = (): TypeormConfig => {
  const commonProps = {
    type: "postgres",
    logging: true,
    synchronize: true,
    entities: [Quack, User, Follow, Requack, Like, Block, Cache],
  };

  if (__prod__) {
    return {
      url: DATABASE_URL as string,
      ssl: true,
      ...commonProps,
    } as TypeormConfig;
  } else {
    return {
      database: DATABASE_NAME as string,
      user: DATABASE_USER as string,
      password: DATABASE_PASSWORD as string,
      ...commonProps,
    } as TypeormConfig;
  }
};
