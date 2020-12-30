import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
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
    @Arg("quackId") quackId: string,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<Boolean> {
    const userId = user!.id;

    const quack = await Quack.findOne(quackId);
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
}
