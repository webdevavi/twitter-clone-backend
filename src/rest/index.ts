import { Router } from "express";
import { verify } from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants";
import { User } from "../entities/User";
import { JWTPayload } from "../types";
import { createAccessToken, createRefreshToken } from "../utils/createJWT";
import { setTokensToCookie } from "../utils/setTokensToCookie";

export const router = Router();

router.get("/", (_, res) => res.send("<h1>Welcome to Quacker</h1>"));

router.post("/refresh_token", async (req, res) => {
  const refreshToken = req.headers.authorization?.split(" ")[1];

  if (!refreshToken) {
    return res.send({ ok: false, message: "No refresh token" });
  }

  try {
    const payload = verify(refreshToken!, REFRESH_TOKEN_SECRET!) as JWTPayload;

    const user = await User.findOne(payload?.userId);

    if (!user) return res.send({ ok: false, message: "No user found" });

    const accessToken = createAccessToken(user!);
    const newRefreshToken = createRefreshToken(user!);

    setTokensToCookie(res, accessToken, newRefreshToken);

    return res.send({ ok: true });
  } catch (e) {
    return res.send({ ok: false, message: e.message });
  }
});
