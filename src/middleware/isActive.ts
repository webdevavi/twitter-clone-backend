import { User } from "../entities/User";
import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isActive: MiddlewareFn<MyContext> = async ({ context }, next) => {
  //@ts-ignore
  const myUserId = context.req.session.userId;

  const user = await User.findOne(myUserId);

  if (!user) {
    throw Error("Your account no longer exists.");
  }

  if (user.amIDeactivated) throw Error("Your account has been deactivated.");

  next();
};
