import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Response } from "express";
export const setTokensToCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie(ACCESS_TOKEN, accessToken, {
    maxAge: 1000 * 60,
  });
  res.cookie(REFRESH_TOKEN, refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};
