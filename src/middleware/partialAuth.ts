import { JWTPayload, MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants";

export const partialAuth: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const accessToken = context.req.headers.authorization?.split(" ")[1];

  if (!accessToken) return next();

  try {
    const payload = verify(accessToken, ACCESS_TOKEN_SECRET!) as JWTPayload;
    if (!payload?.userId) {
      return false;
    }
    const user = await context.userLoader.load(payload?.userId);

    if (!user) return next();

    context.payload.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next();
  }
};
