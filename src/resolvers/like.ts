import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { MyContext, UserRole } from "../types";

@Resolver(Like)
export class LikeResolver {
  @FieldResolver()
  quack(@Root() like: Like) {
    return Quack.findOne(like.quackId);
  }

  @FieldResolver()
  user(@Root() like: Like) {
    return User.findOne(like.userId);
  }

  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
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

  @Query(() => [Like], { nullable: true })
  async likesByQuackId(
    @Arg("quackId", () => Int) quackId: number,
    @Ctx() { userLoader, likeLoaderByQuackId }: MyContext
  ): Promise<(Like | undefined)[] | null> {
    const likes = await likeLoaderByQuackId.load(quackId);

    if (!likes || likes.length === 0) return null;

    return await Promise.all(
      likes.map(async (like) => {
        const user = await userLoader.load(like.userId);
        if (user && !user.amIDeactivated) return like;
        return;
      })
    );
  }

  @Query(() => [Like], { nullable: true })
  async likesByUserId(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { userLoader, likeLoaderByUserId }: MyContext
  ): Promise<(Like | undefined)[] | null> {
    const likes = await likeLoaderByUserId.load(userId);

    if (!likes || likes.length === 0) return null;

    return await Promise.all(
      likes.map(async (like) => {
        const user = await userLoader.load(like.userId);
        if (user && !user.amIDeactivated) return like;
        return;
      })
    );
  }
}
