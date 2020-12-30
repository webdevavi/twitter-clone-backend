import { verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { ACCESS_TOKEN_SECRET } from "../constants";
import { JWTPayload, MyContext, UserRole } from "../types";
import {
  accountAlreadyVerified,
  accountDeactivated,
  accountNotDeactivated,
  accountNotVerified,
} from "./errorMessages";

export const authChecker: AuthChecker<MyContext, UserRole> = async (
  { context },
  roles
) => {
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

    roles.forEach((role) => {
      switch (role) {
        case "ACTIVATED":
          {
            if (user.amIDeactivated) throw Error(accountDeactivated);
          }
          break;
        case "DEACTIVATED":
          {
            if (!user.amIDeactivated) {
              throw Error(accountNotDeactivated);
            }
          }
          break;
        case "VERIFIED":
          {
            if (!user.emailVerified) {
              throw Error(accountNotVerified);
            }
          }
          break;
        case "UNVERIFIED":
          {
            if (user.emailVerified) {
              throw Error(accountAlreadyVerified);
            }
          }
          break;
        default:
          break;
      }
    });
    return true;
  } catch (e) {
    if (
      e.message === accountDeactivated ||
      e.message === accountNotDeactivated ||
      e.message === accountNotVerified ||
      e.message === accountAlreadyVerified
    ) {
      throw e;
    }

    return false;
  }
};
