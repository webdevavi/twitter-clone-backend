import { Router } from "express";
import { verify } from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants";
import { User } from "../entities/User";
import { JWTPayload } from "../types";
import { setTokens } from "../utils/cookies";
import { createAccessToken, createRefreshToken } from "../utils/createJWT";

export const router = Router();

router.get("/", (_, res) => res.send("<h1>Welcome to Quacker</h1>"));

router.post("/refresh_token", async (req, res) => {
  const refreshToken = req.headers.authorization?.split(" ")[1];

  if (!refreshToken || refreshToken === "undefined") {
    return res.status(400).json({ message: "No refresh token" });
  }

  try {
    const payload = verify(refreshToken!, REFRESH_TOKEN_SECRET!) as JWTPayload;

    const user = await User.findOne(payload?.userId);

    if (!user || user === undefined) {
      return res.status(400).json({ message: "No user found" });
    }

    const accessToken = createAccessToken(user!);
    const newRefreshToken = createRefreshToken(user!);

    setTokens(res, accessToken, newRefreshToken);

    return res.sendStatus(200);
  } catch ({ message }) {
    return res.status(400).json({ message });
  }
});
