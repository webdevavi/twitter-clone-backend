import { Follow } from "../entities/Follow";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { User } from "../entities/User";

@Resolver(Follow)
export class FollowResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async follow(@Arg("userId") userId: string, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const followerId = req.session.userId;
    if (userId === followerId) return false;
    const follow = await Follow.findOne({ where: { userId, followerId } });
    if (follow) return true;
    const user = await User.findOne(userId);
    if (!user) return false;
    await Follow.insert({ userId, followerId });
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
    await Follow.delete({ userId, followerId });
    return true;
  }
}
