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
import { paginate } from "../utils/paginate";
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
    @Ctx() { requackLoaderByQuackId }: MyContext
  ): Promise<number> {
    const requacks = await requackLoaderByQuackId.load(quack.id);
    return requacks ? requacks.length : 0;
  }

  @FieldResolver()
  async likes(
    @Root() quack: Quack,
    @Ctx() { likeLoaderByQuackId }: MyContext
  ): Promise<number> {
    const likes = await likeLoaderByQuackId.load(quack.id);
    return likes ? likes.length : 0;
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
  @UseMiddleware(partialAuth)
  async requackStatus(
    @Root() quack: Quack,
    @Ctx() { payload: { user }, requackLoader }: MyContext
  ) {
    if (!user) return null;
    const requacks = await requackLoader.load({
      quackId: quack.id,
      userId: user?.id!,
    });
    if (requacks?.length > 0) return true;
    return false;
  }

  @FieldResolver()
  @UseMiddleware(partialAuth)
  async likeStatus(
    @Root() quack: Quack,
    @Ctx() { payload: { user }, likeLoader }: MyContext
  ) {
    if (!user) return null;
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
    { payload: { user }, followLoaderByFollowerId }: MyContext
  ): Promise<PaginatedQuacks> {
    const q = getConnection()
      .createQueryBuilder()
      .select("q.*")
      .from(Quack, "q")
      .where(`q."isVisible" = true`);

    if (user) {
      const follows = await followLoaderByFollowerId.load(user.id);
      const ids = follows.map((follow) => follow.userId);
      ids.push(user.id);

      q.andWhere(`q."quackedByUserId" in (${ids.join(", ")})`);
    }

    const { data: quacks, hasMore } = await paginate<Quack>({
      queryBuilder: q,
      index: "q.id",
      limit,
      lastIndex,
    });

    return {
      quacks,
      hasMore,
    };
  }

  @Query(() => PaginatedQuacks, { nullable: true })
  @UseMiddleware(partialAuth)
  async quacksFromUser(
    @Arg("userId", () => Int) userId: number,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number,
    @Ctx()
    { payload: { user: me }, blockLoader }: MyContext
  ): Promise<PaginatedQuacks> {
    if (me) {
      const blocks = await blockLoader.load({
        userId: me.id,
        blockedByUserId: userId,
      });

      if (blocks && blocks.length > 0) {
        return {
          quacks: [],
          hasMore: false,
        };
      }
    }

    const user = await User.findOne(userId);

    if (!user) {
      throw Error("User couldn't be found");
    }

    if (user.amIDeactivated) {
      return {
        quacks: [],
        hasMore: false,
      };
    }

    const q = getConnection()
      .createQueryBuilder()
      .select("q.*")
      .from(Quack, "q")
      .where(`q."quackedByUserId" = ${userId}`);

    const { data: quacks, hasMore } = await paginate<Quack>({
      queryBuilder: q,
      index: "q.id",
      limit,
      lastIndex,
    });

    return {
      quacks,
      hasMore,
    };
  }
}
