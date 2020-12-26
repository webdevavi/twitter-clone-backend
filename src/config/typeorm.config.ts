import { createConnection } from "typeorm";
import {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "../constants";

export const typeormConfig = {
  url: DATABASE_URL,
  type: "postgres",
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  logging: true,
  synchronize: true,
  entities: [],
} as Parameters<typeof createConnection>[0];
