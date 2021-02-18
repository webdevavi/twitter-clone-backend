import { verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { ACCESS_TOKEN_SECRET } from "../constants";
import { JWTPayload, MyContext } from "../types";

export const authChecker: AuthChecker<MyContext> = async ({ context }) => {
  const accessToken = context.req.headers.authorization?.split(" ")[1];

  if (!accessToken) return false;

  try {
    const payload = verify(accessToken, ACCESS_TOKEN_SECRET!) as JWTPayload;
    if (!payload?.userId) {
      return false;
    }
    const user = await context.userLoader.load(payload?.userId);

    if (!user) return false;
    context.payload.user = user;

    return true;
  } catch (e) {
    return false;
  }
};
