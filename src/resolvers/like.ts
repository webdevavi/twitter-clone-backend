import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { PaginatedQuacks } from "../response/PaginatedQuacks";
import { PaginatedUsers } from "../response/PaginatedUsers";
import { MyContext } from "../types";
import { likesOrRequacksByQuackId } from "../utils/likesOrRequacksByQuackId";
import { likesOrRequacksByUserId } from "../utils/likesOrRequacksByUserId";

@Resolver(Like)
export class LikeResolver {
  @Mutation(() => Boolean)
  @Authorized()
  async like(
    @Arg("quackId", () => Int) quackId: number,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<Boolean> {
    const userId = user!.id;

    const quack = await Quack.findOne(quackId);
    console.log(quack);
    if (!quack) {
      return false;
    }
    const like = await Like.findOne({ where: { quackId, userId } });
    if (like) {
      await like.remove();
      return true;
    }
    await Like.insert({ quackId, userId });
    return true;
  }

  @Query(() => PaginatedUsers, { nullable: true })
  async likesByQuackId(
    @Arg("quackId", () => Int) quackId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { likeLoaderByQuackId, blockLoaderByUserId, payload: { user } }: MyContext
  ): Promise<PaginatedUsers> {
    const { users, hasMore } = await likesOrRequacksByQuackId({
      quackId,
      user,
      limit,
      lastIndex,
      blockLoaderByUserId,
      loaderByQuackId: likeLoaderByQuackId,
    });

    return {
      users,
      hasMore,
    };
  }

  @Query(() => PaginatedQuacks, { nullable: true })
  async likesByUserId(
    @Arg("userId", () => Int) userId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { likeLoaderByUserId, blockLoaderByUserId, payload: { user } }: MyContext
  ): Promise<PaginatedQuacks> {
    const { quacks, hasMore } = await likesOrRequacksByUserId<Like>({
      userId,
      user,
      limit,
      lastIndex,
      blockLoaderByUserId,
      loaderByUserId: likeLoaderByUserId,
    });

    return {
      quacks,
      hasMore,
    };
  }
}
