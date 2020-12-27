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
import { Requack } from "../entities/Requack";
import { isActive } from "../middleware/isActive";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Requack)
export class RequackResolver {
  @FieldResolver()
  quack(@Root() requack: Requack) {
    return Quack.findOne(requack.quackId);
  }

  @FieldResolver()
  user(@Root() requack: Requack) {
    return User.findOne(requack.userId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isActive)
  async requack(
    @Arg("quackId") quackId: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    //@ts-ignore
    const userId = req.session.userId;

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
}
