import { Arg, Authorized, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { Block } from "../entities/Block";
import { Follow } from "../entities/Follow";
import { MyContext, UserRole } from "../types";

@Resolver(Block)
export class BlockResolver {
  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async block(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { payload: { user: me }, userLoader }: MyContext
  ) {
    const myUserId = me?.id;
    if (userId === myUserId) return false;
    const blocked = await Block.findOne({
      where: { userId, blockedByUserId: myUserId },
    });
    if (blocked) return true;
    const user = await userLoader.load(userId);
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
  @Authorized<UserRole>(["ACTIVATED"])
  async unblock(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { payload: { user: me }, userLoader }: MyContext
  ) {
    const myUserId = me?.id;
    if (userId === myUserId) return false;
    const blocked = await Block.findOne({
      where: { userId, blockedByUserId: myUserId },
    });
    if (!blocked) return true;
    const user = await userLoader.load(userId);
    if (!user) return false;
    if (user.amIDeactivated) return false;
    await Block.delete({ userId, blockedByUserId: myUserId });
    return true;
  }
}
