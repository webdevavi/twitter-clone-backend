import { Response } from "express";
import { ACCESS_TOKEN, REFRESH_TOKEN, __prod__ } from "../constants";

export const setTokens = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie(ACCESS_TOKEN, accessToken, {
    secure: __prod__,
    sameSite: __prod__ && "none",
    maxAge: 1000 * 60, // 1 minute
  });
  res.cookie(REFRESH_TOKEN, refreshToken, {
    secure: __prod__,
    sameSite: __prod__ && "none",
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  });
};

export const clearTokens = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN, {
    secure: __prod__,
    sameSite: __prod__ && "none",
  });
  res.clearCookie(REFRESH_TOKEN, {
    secure: __prod__,
    sameSite: __prod__ && "none",
  });
};