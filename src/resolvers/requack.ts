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
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { partialAuth } from "../middleware/partialAuth";
import { PaginatedQuacks } from "../response/PaginatedQuacks";
import { PaginatedUsers } from "../response/PaginatedUsers";
import { MyContext, UserRole } from "../types";
import { likesOrRequacksByQuackId } from "../utils/likesOrRequacksByQuackId";
import { likesOrRequacksByUserId } from "../utils/likesOrRequacksByUserId";

@Resolver(Requack)
export class RequackResolver {
  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async requack(
    @Arg("quackId", () => Int) quackId: number,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<Boolean> {
    const userId = user!.id;

    const quack = await Quack.findOne(quackId);
    if (!quack) {
      return false;
    }
    const requack = await Requack.findOne({ where: { quackId, userId } });
    if (requack) {
      await requack.remove();
      return true;
    }
    await Requack.insert({ quackId, userId });
    return true;
  }

  @Query(() => PaginatedUsers, { nullable: true })
  @UseMiddleware(partialAuth)
  async requacksByQuackId(
    @Arg("quackId", () => Int) quackId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    {
      requackLoaderByQuackId,
      blockLoaderByUserId,
      payload: { user },
    }: MyContext
  ): Promise<PaginatedUsers> {
    const { users, hasMore } = await likesOrRequacksByQuackId({
      quackId,
      user,
      limit,
      lastIndex,
      blockLoaderByUserId,
      loaderByQuackId: requackLoaderByQuackId,
    });

    return {
      users,
      hasMore,
    };
  }

  @Query(() => PaginatedQuacks, { nullable: true })
  @UseMiddleware(partialAuth)
  async requacksByUserId(
    @Arg("userId", () => Int) userId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { requackLoaderByUserId, blockLoaderByUserId, payload: { user } }: MyContext
  ): Promise<PaginatedQuacks> {
    const { quacks, hasMore } = await likesOrRequacksByUserId<Requack>({
      userId,
      user,
      limit,
      lastIndex,
      blockLoaderByUserId,
      loaderByUserId: requackLoaderByUserId,
    });

    return {
      quacks,
      hasMore,
    };
  }
}
