import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { Block } from "../entities/Block";
import { Follow } from "../entities/Follow";
import { MyContext, UserRole } from "../types";

@Resolver(Follow)
export class FollowResolver {
  @FieldResolver()
  user(@Root() follow: Follow, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(follow.userId);
  }

  @FieldResolver()
  follower(@Root() follow: Follow, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(follow.followerId);
  }

  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async follow(
    @Arg("userId") userId: string,
    @Ctx() { payload: { user: me }, userLoader }: MyContext
  ) {
    const myUserId = me?.id;
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
    const user = await userLoader.load(userId);
    if (!user) return false;
    if (user.amIDeactivated) return false;
    await Follow.insert({ userId, followerId: myUserId });
    return true;
  }

  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async unfollow(
    @Arg("userId") userId: string,
    @Ctx() { payload: { user: me }, userLoader }: MyContext
  ) {
    const followerId = me?.id;
    if (userId === followerId) return false;
    const follow = await Follow.findOne({ where: { userId, followerId } });
    if (!follow) return true;
    const user = await userLoader.load(userId);
    if (!user) return false;
    if (user.amIDeactivated) return false;
    await Follow.delete({ userId, followerId });
    return true;
  }
}
