import cors from "cors";
import { ORIGIN } from "../constants";

export const corsConfig = {
  origin: ORIGIN,
  credentials: true,
} as Parameters<typeof cors>[0];
