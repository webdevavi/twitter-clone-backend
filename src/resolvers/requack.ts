import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { MyContext, UserRole } from "../types";

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
  @Authorized<UserRole>(["ACTIVATED"])
  async requack(
    @Arg("quackId") quackId: number,
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
}
