import { sign } from "jsonwebtoken";
import { JWTPayload } from "src/types";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../constants";
import { User } from "../entities/User";

function getPayload(user: User): JWTPayload {
  return {
    userId: user.id,
  };
}

export const createAccessToken = (user: User): string =>
  sign(getPayload(user), ACCESS_TOKEN_SECRET!, {
    expiresIn: "1m",
  });

export const createRefreshToken = (user: User): string =>
  sign(getPayload(user), REFRESH_TOKEN_SECRET!, {
    expiresIn: "1y",
  });
