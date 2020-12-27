import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Quack } from "../entities/Quack";
import { Like } from "../entities/Like";
import { isActive } from "../middleware/isActive";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

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
  @UseMiddleware(isAuth)
  @UseMiddleware(isActive)
  async like(
    @Arg("quackId") quackId: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    //@ts-ignore
    const userId = req.session.userId;

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
