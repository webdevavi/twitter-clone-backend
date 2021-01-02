import getUrls from "get-urls";
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
import { In } from "typeorm";
import { Follow } from "../entities/Follow";
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { QuackInput } from "../input/QuackInput";
import { QuackResponse } from "../response/QuackResponse";
import { MyContext, UserRole } from "../types";
import { QuackValidator } from "../validators/quack";

@Resolver(Quack)
export class QuackResolver {
  @FieldResolver(() => String, { nullable: true })
  truncatedText(@Root() quack: Quack) {
    if (quack.text.length > 50) {
      return quack.text.slice(0, 50) + "...";
    }

    return null;
  }

  @FieldResolver()
  quackedByUser(@Root() quack: Quack) {
    return User.findOne(quack.quackedByUserId);
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
  replies(@Root() quack: Quack) {
    return Quack.find({
      where: { inReplyToQuackId: quack.id, isVisible: true },
    });
  }

  @FieldResolver()
  urls(@Root() quack: Quack) {
    const urlsSet = getUrls(quack.text);
    return [...urlsSet];
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
    @Arg("quackId") quackId: string,
    @Ctx() { payload: { user } }: MyContext
  ) {
    const quack = await Quack.findOne(quackId);

    if (!quack) return true;

    if (quack?.quackedByUserId !== user!.id) return false;

    await quack.remove();
    return true;
  }

  @Query(() => [Quack], { nullable: true })
  quacks() {
    return Quack.find({ where: { isVisible: true } });
  }

  @Query(() => [Quack], { nullable: true })
  @Authorized<UserRole>(["ACTIVATED"])
  async quacksFromFollowings(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 })
    offset: number,
    @Ctx()
    { payload: { user } }: MyContext
  ): Promise<Quack[]> {
    const follows = await Follow.find({
      where: { followerId: user!.id },
    });
    const followingIds = follows.map((follow) => follow.userId);
    return Quack.find({
      where: { quackedByUserId: In(followingIds), isVisible: true },
      take: limit,
      skip: offset,
    });
  }
}
