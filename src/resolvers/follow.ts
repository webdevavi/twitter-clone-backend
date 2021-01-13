import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Block } from "../entities/Block";
import { Follow } from "../entities/Follow";
import { User } from "../entities/User";
import { MyContext, UserRole } from "../types";

@Resolver(Follow)
export class FollowResolver {
  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async follow(
    @Arg("userId", () => Int) userId: number,
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
    @Arg("userId", () => Int) userId: number,
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

  @Query(() => [User], { nullable: true })
  async followersByUserId(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { followLoaderByUserId, userLoader }: MyContext
  ): Promise<(User | Error)[]> {
    const follows = await followLoaderByUserId.load(userId);

    if (!follows) return [];

    const userIds = follows.map((follow) => follow.followerId);

    return await userLoader.loadMany(userIds);
  }

  @Query(() => [User], { nullable: true })
  async followingsByUserId(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { followLoaderByFollowerId, userLoader }: MyContext
  ): Promise<(User | Error)[]> {
    const follows = await followLoaderByFollowerId.load(userId);

    if (!follows) return [];

    const userIds = follows.map((follow) => follow.userId);

    return await userLoader.loadMany(userIds);
  }
}
