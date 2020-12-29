import getUrls from "get-urls";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { In } from "typeorm";
import { Follow } from "../entities/Follow";
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { QuackInput } from "../input/QuackInput";
import { isActive } from "../middleware/isActive";
import { isAuth } from "../middleware/isAuth";
import { QuackResponse } from "../response/QuackResponse";
import { MyContext } from "../types";
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
  async requackStatus(
    @Root() quack: Quack,
    @Ctx() { req, requackLoader }: MyContext
  ) {
    //@ts-ignore
    const userId = req.session.userId;

    const requacks = await requackLoader.load({ quackId: quack.id, userId });
    if (requacks?.length > 0) return true;
    return false;
  }

  @FieldResolver()
  async likeStatus(
    @Root() quack: Quack,
    @Ctx() { req, likeLoader }: MyContext
  ) {
    //@ts-ignore
    const userId = req.session.userId;

    const likes = await likeLoader.load({ quackId: quack.id, userId });
    if (likes?.length > 0) return true;
    return false;
  }

  @Mutation(() => QuackResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isActive)
  async quack(
    @Arg("input") { text, inReplyToQuackId }: QuackInput,
    @Ctx() { req }: MyContext
  ): Promise<QuackResponse> {
    //@ts-ignore
    const myUserId = req.session.userId;
    const errors = new QuackValidator(text).validate();
    if (errors.length !== 0) {
      return { errors };
    }

    const inReplyToQuack = await Quack.findOne({
      where: { id: inReplyToQuackId, isVisible: true },
    });

    if (!inReplyToQuack)
      return {
        errors: [
          {
            field: "inReplyToQuackId",
            message: "The quack you are replying to no longer exists.",
          },
        ],
      };

    const quack = Quack.create({
      text,
      //@ts-ignore
      quackedByUserId: req.session.userId,
      inReplyToQuackId,
    });

    await quack.save();
    return { quack };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isActive)
  async deleteQuack(
    @Arg("quackId") quackId: string,
    @Ctx() { req }: MyContext
  ) {
    //@ts-ignore
    const myUserId = req.session.userId;

    const quack = await Quack.findOne(quackId);

    if (quack?.quackedByUserId !== myUserId) return false;

    if (!quack) return true;

    await quack.remove();
    return true;
  }

  @Query(() => [Quack], { nullable: true })
  quacks() {
    return Quack.find({ where: { isVisible: true } });
  }

  @Query(() => [Quack], { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isActive)
  async quacksFromFollowings(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 })
    offset: number,
    @Ctx()
    { req }: MyContext
  ): Promise<Quack[]> {
    const follows = await Follow.find({
      //@ts-ignore
      where: { followerId: req.session.userId },
    });
    const followingIds = follows.map((follow) => follow.userId);
    return Quack.find({
      where: { quackedByUserId: In(followingIds), isVisible: true },
      take: limit,
      skip: offset,
    });
  }
}
