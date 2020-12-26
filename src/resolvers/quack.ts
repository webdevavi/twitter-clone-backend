import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { In } from "typeorm";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { QuackInput } from "../input/QuackInput";
import { isAuth } from "../middleware/isAuth";
import { QuackResponse } from "../response/QuackResponse";
import { MyContext } from "../types";
import { QuackValidator } from "../validators/quack";
import getUrls from "get-urls";

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
  requacks(@Root() quack: Quack) {
    return Requack.find({ where: { quackId: quack.id } });
  }

  @FieldResolver()
  likes(@Root() quack: Quack) {
    return Like.find({ where: { quackId: quack.id } });
  }

  @FieldResolver()
  replies(@Root() quack: Quack) {
    return Quack.find({ where: { inReplyToQuackId: quack.id } });
  }

  @FieldResolver()
  urls(@Root() quack: Quack) {
    const urlsSet = getUrls(quack.text);
    return [...urlsSet];
  }

  @Mutation(() => QuackResponse)
  @UseMiddleware(isAuth)
  async quack(
    @Arg("input") { text, inReplyToQuackId }: QuackInput,
    @Ctx() { req }: MyContext
  ): Promise<QuackResponse> {
    const errors = new QuackValidator(text).validate();
    if (errors.length !== 0) {
      return { errors };
    }

    const inReplyToQuack = await Quack.findOne(inReplyToQuackId);

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
  async deleteQuack(
    @Arg("quackId") quackId: string,
    @Ctx() { req }: MyContext
  ) {
    const quack = await Quack.findOne(quackId);
    //@ts-ignore
    if (quack?.quackedByUserId !== req.session.userId) return false;
    if (!quack) return true;
    await quack.remove();
    return true;
  }

  @Query(() => [Quack], { nullable: true })
  quacks() {
    return Quack.find();
  }

  @Query(() => [Quack], { nullable: true })
  @UseMiddleware(isAuth)
  async quacksFromFollowings(@Ctx() { req }: MyContext): Promise<Quack[]> {
    const follows = await Follow.find({
      //@ts-ignore
      where: { followerId: req.session.userId },
    });
    const followingIds = follows.map((follow) => follow.userId);
    return Quack.find({ where: { quackedByUserId: In(followingIds) } });
  }
}
