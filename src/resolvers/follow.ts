import DataLoader from "dataloader";
import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Block } from "../entities/Block";
import { Follow } from "../entities/Follow";
import { User } from "../entities/User";
import { partialAuth } from "../middleware/partialAuth";
import { PaginatedUsers } from "../response/PaginatedUsers";
import { MyContext, UserRole } from "../types";
import { paginate } from "../utils/paginate";

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

  @Query(() => PaginatedUsers, { nullable: true })
  @UseMiddleware(partialAuth)
  async followersByUserId(
    @Arg("userId", () => Int) userId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { followLoaderByUserId, blockLoaderByUserId, payload: { user } }: MyContext
  ): Promise<PaginatedUsers> {
    return await _fetchFollowsUsers({
      userId,
      followLoader: followLoaderByUserId,
      blockLoaderByUserId,
      user,
      limit,
      lastIndex,
      key: "followerId",
    });
  }

  @Query(() => PaginatedUsers, { nullable: true })
  @UseMiddleware(partialAuth)
  async followingsByUserId(
    @Arg("userId", () => Int) userId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    {
      followLoaderByFollowerId,
      blockLoaderByUserId,
      payload: { user },
    }: MyContext
  ): Promise<PaginatedUsers> {
    return await _fetchFollowsUsers({
      userId,
      followLoader: followLoaderByFollowerId,
      blockLoaderByUserId,
      user,
      limit,
      lastIndex,
      key: "userId",
    });
  }
}

async function _fetchFollowsUsers({
  userId,
  followLoader,
  blockLoaderByUserId,
  user,
  limit,
  lastIndex,
  key,
}: {
  userId: number;
  followLoader: DataLoader<number, Follow[], number>;
  blockLoaderByUserId: DataLoader<number, Block[], number>;
  user: User | undefined;
  limit: number;
  lastIndex: number;
  key: "userId" | "followerId";
}) {
  userId;
  const follows = await followLoader.load(userId);

  if (!follows || follows.length < 1) return { users: [], hasMore: false };

  const userIds = follows.map((follow) => follow[key]);

  const u = getConnection()
    .createQueryBuilder()
    .select("u.*")
    .from(User, "u")
    .orderBy({ "u.id": "DESC" }).where(`
        u.id in (${userIds.join(",")})
      `);

  if (user) {
    const blockIds = (await blockLoaderByUserId.load(user.id)).map(
      (block) => block.blockedByUserId
    );

    if (blockIds && blockIds.length > 0) {
      u.andWhere(`
        u.id not in (${blockIds.join(",")})
    `);
    }
  }

  const { data: users, hasMore } = await paginate<User>({
    queryBuilder: u,
    limit,
    index: "u.id",
    lastIndex,
  });

  return {
    users,
    hasMore,
  };
}
