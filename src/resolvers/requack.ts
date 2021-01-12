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

  @Query(() => [Requack], { nullable: true })
  async requacksByQuackId(
    @Arg("quackId", () => Int) quackId: number,
    @Ctx() { userLoader, requackLoaderByQuackId }: MyContext
  ): Promise<(Requack | undefined)[] | null> {
    const requacks = await requackLoaderByQuackId.load(quackId);

    if (!requacks || requacks.length === 0) return null;

    return await Promise.all(
      requacks.map(async (requack) => {
        const user = await userLoader.load(requack.userId);
        if (user && !user.amIDeactivated) return requack;
        return;
      })
    );
  }

  @Query(() => [Requack], { nullable: true })
  async requacksByUserId(
    @Arg("userId", () => Int) userId: number,
    @Ctx() { userLoader, requackLoaderByUserId }: MyContext
  ): Promise<(Requack | undefined)[] | null> {
    const requacks = await requackLoaderByUserId.load(userId);

    if (!requacks || requacks.length === 0) return null;

    return await Promise.all(
      requacks.map(async (requack) => {
        const user = await userLoader.load(requack.userId);
        if (user && !user.amIDeactivated) return requack;
        return;
      })
    );
  }
}
