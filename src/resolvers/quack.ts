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
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Follow } from "../entities/Follow";
import { Link } from "../entities/Link";
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { QuackInput } from "../input/QuackInput";
import { partialAuth } from "../middleware/partialAuth";
import { PaginatedQuacks } from "../response/PaginatedQuacks";
import { QuackResponse } from "../response/QuackResponse";
import { MyContext, UserRole } from "../types";
import { getHashtags } from "../utils/getHashtags";
import { getMentions } from "../utils/getMentions";
import { scrapeMetatags } from "../utils/scrapeMetatags";
import { QuackValidator } from "../validators/quack";

@Resolver(Quack)
export class QuackResolver {
  @FieldResolver(() => String, { nullable: true })
  truncatedText(@Root() quack: Quack) {
    if (quack.text.length > 50) {
      return quack.text.slice(0, 50) + "...";
    }

    return quack.text;
  }

  @FieldResolver(() => Quack, { nullable: true })
  @UseMiddleware(partialAuth)
  async inReplyToQuack(
    @Root() quack: Quack,
    @Ctx() { quackLoader, blockLoader, payload: { user } }: MyContext
  ) {
    if (!quack.inReplyToQuackId) {
      return null;
    }

    const rQuack = await quackLoader.load(quack.inReplyToQuackId);

    if (!rQuack) {
      return null;
    }

    if (user) {
      const blocked = await blockLoader.load({
        userId: user.id,
        blockedByUserId: rQuack.quackedByUserId,
      });

      if (blocked && blocked.length > 0) {
        return null;
      }
    }

    return rQuack;
  }

  @FieldResolver()
  @UseMiddleware(partialAuth)
  async quackedByUser(
    @Root() quack: Quack,
    @Ctx() { userLoader, blockLoader, payload: { user } }: MyContext
  ) {
    if (user) {
      const blocked = await blockLoader.load({
        userId: user.id,
        blockedByUserId: quack.quackedByUserId,
      });

      if (blocked && blocked.length > 0) {
        return null;
      }
    }
    return userLoader.load(quack.quackedByUserId);
  }

  @FieldResolver()
  async requacks(
    @Root() quack: Quack,
    @Ctx() { userLoader, requackLoaderByQuackId }: MyContext
  ) {
    const requacks = await requackLoaderByQuackId.load(quack.id);
    return requacks.map(async (requack) => {
      const user = await userLoader.load(requack.userId);
      if (user && !user.amIDeactivated) return requack;
      return;
    });
  }

  @FieldResolver()
  async likes(
    @Root() quack: Quack,
    @Ctx() { userLoader, likeLoaderByQuackId }: MyContext
  ) {
    const likes = await likeLoaderByQuackId.load(quack.id);
    return likes.map(async (like) => {
      const user = await userLoader.load(like.userId);
      if (user && !user.amIDeactivated) return like;
      return;
    });
  }

  @FieldResolver()
  @UseMiddleware(partialAuth)
  async replies(
    @Root() quack: Quack,
    @Ctx()
    { quackLoaderByInReplyToQuackId, blockLoader, payload: { user } }: MyContext
  ) {
    if (user) {
      const blocked = await blockLoader.load({
        userId: user.id,
        blockedByUserId: quack.quackedByUserId,
      });

      if (blocked && blocked.length > 0) {
        return null;
      }
    }
    return quackLoaderByInReplyToQuackId.load(quack.id);
  }

  @FieldResolver()
  links(@Root() quack: Quack): Promise<Link[] | null> {
    return scrapeMetatags(quack.text, quack.id);
  }

  @FieldResolver()
  @UseMiddleware(partialAuth)
  async mentions(
    @Root() quack: Quack,
    @Ctx()
    { userLoaderByUsername, blockLoaderByUserId, payload: { user } }: MyContext
  ) {
    const usernames = getMentions(quack.text, false);
    const users = await userLoaderByUsername.loadMany(usernames);

    if (user) {
      const blocks = (await blockLoaderByUserId.load(user.id)).map(
        (block) => block.blockedByUserId
      );
      return users.filter((user) => !blocks.includes((user as User)?.id));
    }

    return users;
  }

  @FieldResolver()
  hashtags(@Root() quack: Quack) {
    return getHashtags(quack.text);
  }

  @FieldResolver()
  @Authorized<UserRole>()
  async requackStatus(
    @Root() quack: Quack,
    @Ctx() { payload: { user }, requackLoader }: MyContext
  ) {
    const requacks = await requackLoader.load({
      quackId: quack.id,
      userId: user?.id!,
    });
    if (requacks?.length > 0) return true;
    return false;
  }

  @FieldResolver()
  @Authorized<UserRole>()
  async likeStatus(
    @Root() quack: Quack,
    @Ctx() { payload: { user }, likeLoader }: MyContext
  ) {
    const likes = await likeLoader.load({
      quackId: quack.id,
      userId: user?.id!,
    });
    if (likes?.length > 0) return true;

    return false;
  }

  @Mutation(() => QuackResponse)
  @Authorized<UserRole>(["ACTIVATED"])
  async quack(
    @Arg("input") { text, inReplyToQuackId }: QuackInput,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<QuackResponse> {
    const errors = new QuackValidator(text).validate();
    if (errors.length !== 0) {
      return { errors };
    }

    if (inReplyToQuackId) {
      const inReplyToQuack = await Quack.findOne({
        where: { id: inReplyToQuackId, isVisible: true },
      });

      if (!inReplyToQuack) {
        return {
          errors: [
            {
              field: "inReplyToQuackId",
              message: "The quack you are replying to no longer exists.",
            },
          ],
        };
      }
    }

    const quack = Quack.create({
      text,
      quackedByUserId: user!.id,
      inReplyToQuackId,
    });

    await quack.save();
    return { quack };
  }

  @Mutation(() => Boolean)
  @Authorized<UserRole>(["ACTIVATED"])
  async deleteQuack(
    @Arg("quackId", () => Int) quackId: number,
    @Ctx() { payload: { user } }: MyContext
  ) {
    const quack = await Quack.findOne(quackId);

    if (!quack) return true;

    if (quack?.quackedByUserId !== user!.id) return false;

    await quack.remove();
    return true;
  }

  @Query(() => Quack, { nullable: true })
  @UseMiddleware(partialAuth)
  async quackById(
    @Arg("id", () => Int) id: number,
    @Ctx() { payload: { user }, blockLoaderByUserId }: MyContext
  ) {
    const q = getConnection()
      .getRepository(Quack)
      .createQueryBuilder("q")
      .where(`q.id = ${id}`)
      .andWhere(`q."isVisible" = true`);

    if (user) {
      const ids = (await blockLoaderByUserId.load(user.id)).map(
        (block) => block.blockedByUserId
      );
      if (ids.length > 0) {
        q.andWhere(`q."quackedByUserId" not in (${ids.join(", ")})`);
      }
    }
    return await q.getOne();
  }

  @Query(() => PaginatedQuacks, { nullable: true })
  @UseMiddleware(partialAuth)
  async quacksForMe(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { payload: { user } }: MyContext
  ): Promise<PaginatedQuacks> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const q = getConnection()
      .createQueryBuilder()
      .select("q.*")
      .from(Quack, "q")
      .where(`q."isVisible" = true`)
      .take(realLimitPlusOne)
      .orderBy({ "q.id": "DESC" });

    if (user) {
      const follows = await Follow.find({
        where: { followerId: user.id },
      });
      const ids = follows.map((follow) => follow.userId);
      ids.push(user.id);

      q.andWhere(`q."quackedByUserId" in (${ids.join(", ")})`);
    }

    if (lastIndex) {
      q.andWhere(`q.id < ${lastIndex}`);
    }

    const quacks = await q.execute();

    return {
      quacks: quacks?.slice(0, realLimit),
      hasMore: quacks?.length === realLimitPlusOne,
    };
  }
}
