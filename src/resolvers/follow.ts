import { Follow } from "../entities/Follow";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { User } from "../entities/User";
import { Block } from "../entities/Block";

@Resolver(Follow)
export class FollowResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async follow(@Arg("userId") userId: string, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const myUserId = req.session.userId;
    if (userId === myUserId) return false;

    const haveIBlocked = await Block.find({
      where: { userId, blockedByUserId: myUserId },
    });
    if (haveIBlocked?.length > 0) return false;

    const amIBlocked = await Block.find({
      where: { userId: myUserId, blockedByUserId: userId },
    });
    if (amIBlocked?.length > 0) return false;

    const follow = await Follow.findOne({
      where: { userId, followerId: myUserId },
    });
    if (follow) return true;
    const user = await User.findOne(userId);
    console.log(user);

    if (!user) return false;
    if (user.amIDeactivated) return false;
    await Follow.insert({ userId, followerId: myUserId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async unfollow(@Arg("userId") userId: string, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const followerId = req.session.userId;
    if (userId === followerId) return false;
    const follow = await Follow.findOne({ where: { userId, followerId } });
    if (!follow) return true;
    const user = await User.findOne(userId);
    if (!user) return false;
    console.log(user);
    if (user.amIDeactivated) return false;
    await Follow.delete({ userId, followerId });
    return true;
  }
}
