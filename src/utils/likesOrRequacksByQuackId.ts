import DataLoader from "dataloader";
import { getConnection } from "typeorm";
import { Block } from "../entities/Block";
import { Like } from "../entities/Like";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { paginate } from "./paginate";

export async function likesOrRequacksByQuackId<T extends Like | Requack>({
  quackId,
  loaderByQuackId,
  blockLoaderByUserId,
  user,
  limit,
  lastIndex,
}: {
  quackId: number;
  loaderByQuackId: DataLoader<number, T[], number>;
  blockLoaderByUserId: DataLoader<number, Block[], number>;
  user: User | undefined;
  limit: number;
  lastIndex: number;
}) {
  const likesOrReusers = await loaderByQuackId.load(quackId);

  if (!likesOrReusers || likesOrReusers.length < 1) {
    return { users: [], hasMore: false };
  }

  const userIds = likesOrReusers.map((likeOrRequack) => likeOrRequack.userId);

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
