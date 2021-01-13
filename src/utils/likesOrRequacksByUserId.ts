import DataLoader from "dataloader";
import { getConnection } from "typeorm";
import { Block } from "../entities/Block";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { paginate } from "./paginate";

export async function likesOrRequacksByUserId<T extends Like | Requack>({
  userId,
  loaderByUserId,
  blockLoaderByUserId,
  user,
  limit,
  lastIndex,
}: {
  userId: number;
  loaderByUserId: DataLoader<number, T[], number>;
  blockLoaderByUserId: DataLoader<number, Block[], number>;
  user: User | undefined;
  limit: number;
  lastIndex: number;
}) {
  const likesOrRequacks = await loaderByUserId.load(userId);

  if (!likesOrRequacks || likesOrRequacks.length < 1) {
    return { quacks: [], hasMore: false };
  }
  const quackIds = likesOrRequacks.map(
    (likeOrRequack) => likeOrRequack.quackId
  );

  const q = getConnection()
    .createQueryBuilder()
    .select("q.*")
    .from(Quack, "q")
    .where(`q."isVisible" = true`).where(`
        q.id in (${quackIds.join(",")})
      `);

  if (user) {
    const blockIds = (await blockLoaderByUserId.load(user.id)).map(
      (block) => block.blockedByUserId
    );

    if (blockIds && blockIds.length > 0) {
      q.andWhere(`
          q."quackedByUserId" not in (${blockIds.join(",")})
          `);
    }
  }

  const { data: quacks, hasMore } = await paginate<Quack>({
    queryBuilder: q,
    limit,
    index: "q.id",
    lastIndex,
  });

  return {
    quacks,
    hasMore,
  };
}
