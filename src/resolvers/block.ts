import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Block } from "../entities/Block";
import { Follow } from "../entities/Follow";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Block)
export class BlockResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async block(@Arg("userId") userId: string, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const myUserId = req.session.userId;
    if (userId === myUserId) return false;
    const blocked = await Block.findOne({
      where: { userId, blockedByUserId: myUserId },
    });
    if (blocked) return true;
    const user = await User.findOne(userId);
    if (!user) return false;
    if (user.amIDeactivated) return false;
    await getConnection().transaction(async (em) => {
      em.insert(Block, { userId, blockedByUserId: myUserId });
      em.delete(Follow, { userId, followerId: myUserId });
      em.delete(Follow, { userId: myUserId, followerId: userId });
    });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async unblock(@Arg("userId") userId: string, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const myUserId = req.session.userId;
    if (userId === myUserId) return false;
    const blocked = await Block.findOne({
      where: { userId, blockedByUserId: myUserId },
    });
    if (!blocked) return true;
    const user = await User.findOne(userId);
    if (!user) return false;
    if (user.amIDeactivated) return false;
    await Block.delete({ userId, blockedByUserId: myUserId });
    return true;
  }
}
