import { ACCESS_TOKEN, REFRESH_TOKEN, __prod__ } from "../constants";
import { Response } from "express";
export const setTokensToCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie(ACCESS_TOKEN, accessToken, {
    maxAge: 1000 * 60,
    httpOnly: __prod__,
  });
  res.cookie(REFRESH_TOKEN, refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: __prod__,
  });
};
