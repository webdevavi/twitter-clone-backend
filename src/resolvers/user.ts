import argon from "argon2";
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
import { Quack } from "../entities/Quack";
import { User } from "../entities/User";
import { UserInput } from "../input/UserInput";
import { partialAuth } from "../middleware/partialAuth";
import { PaginatedUsers } from "../response/PaginatedUsers";
import { UserResponse } from "../response/UserResponse";
import { MyContext } from "../types";
import { createAccessToken, createRefreshToken } from "../utils/createJWT";
import { paginate } from "../utils/paginate";
import { validEmail } from "../utils/regexp";
import { ValidateUser } from "../validators/user";

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => Int, { defaultValue: 0 })
  async followers(
    @Root() user: User,
    @Ctx() { followLoaderByUserId }: MyContext
  ): Promise<number> {
    return (await followLoaderByUserId.load(user.id))?.length || 0;
  }

  @FieldResolver(() => Int, { defaultValue: 0 })
  async followings(
    @Root() user: User,
    @Ctx() { followLoaderByFollowerId }: MyContext
  ): Promise<number> {
    return (await followLoaderByFollowerId.load(user.id))?.length || 0;
  }

  @FieldResolver(() => [Quack], { defaultValue: 0 })
  async quacks(@Root() user: User, @Ctx() { quackLoaderByUserId }: MyContext) {
    return (await quackLoaderByUserId.load(user.id))?.length || 0;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @UseMiddleware(partialAuth)
  async haveIBlockedThisUser(
    @Root() user: User,
    @Ctx() { payload: { user: me }, blockLoader }: MyContext
  ) {
    if (!me) return null;
    const myUserId = me?.id;
    if (user.id === myUserId) return null;
    const block = await blockLoader.load({
      userId: user.id,
      blockedByUserId: myUserId!,
    });
    if (!block || block.length < 1) return false;
    return true;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @UseMiddleware(partialAuth)
  async amIBlockedByThisUser(
    @Root() user: User,
    @Ctx() { payload: { user: me }, blockLoader }: MyContext
  ) {
    if (!me) return null;
    const myUserId = me?.id;
    if (user.id === myUserId) return null;
    const block = await blockLoader.load({
      userId: myUserId!,
      blockedByUserId: user.id,
    });
    if (!block || block.length < 1) return false;
    return true;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @UseMiddleware(partialAuth)
  async followStatus(
    @Root() user: User,
    @Ctx() { payload: { user: me }, followLoader }: MyContext
  ) {
    if (!me) return null;
    const myUserId = me.id;
    if (user.id === myUserId) return null;
    const follow = await followLoader.load({
      userId: user.id,
      followerId: myUserId,
    });
    if (!follow || follow.length < 1) return false;
    return true;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @UseMiddleware(partialAuth)
  async followBackStatus(
    @Root() user: User,
    @Ctx() { payload: { user: me }, followLoader }: MyContext
  ) {
    if (!me) return null;
    const myUserId = me.id;
    if (user.id === myUserId) return null;
    const follow = await followLoader.load({
      followerId: user.id,
      userId: myUserId!,
    });
    if (!follow || follow.length < 1) return false;
    return true;
  }

  @Mutation(() => UserResponse)
  async signup(@Arg("input") input: UserInput): Promise<UserResponse> {
    const errors = new ValidateUser(input).validate();

    if (errors.length !== 0) {
      return { errors };
    }

    const { displayName, username, email, password } = input;

    const hashedPassword = await argon.hash(password);

    const user = User.create({
      displayName,
      rawUsername: username.toLowerCase(),
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await user.save();
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      return { user, accessToken, refreshToken };
    } catch (error) {
      if (error.detail.includes("already exists")) {
        if (error.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "An user with this email already exists.",
              },
            ],
          };
        } else if (error.detail.includes("rawUsername")) {
          return {
            errors: [
              {
                field: "username",
                message: "The username is taken.",
              },
            ],
          };
        }
      }
      throw error;
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("emailOrUsername") emailOrUsername: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const isEmail = validEmail.test(emailOrUsername);

    const user = await User.findOne({
      where: isEmail
        ? { email: emailOrUsername.toLowerCase() }
        : { rawUsername: emailOrUsername.toLowerCase() },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "emailOrUsername",
            message: "The user does not exist.",
          },
        ],
      };
    }

    if (await argon.verify(user.password, password)) {
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      return { user, accessToken, refreshToken };
    } else {
      return {
        errors: [
          {
            field: "password",
            message: "The password is incorrect.",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  @Authorized()
  async changePasswordWithOldPassword(
    @Arg("password") password: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<UserResponse> {
    const errors = new ValidateUser({ password, newPassword }).validate();

    if (errors.length !== 0) {
      return { errors };
    }

    if (await argon.verify(user!.password, password)) {
      const hashedPassword = await argon.hash(newPassword);

      user!.password = hashedPassword;
      await user?.save();

      return { user };
    } else {
      return {
        errors: [
          {
            field: "password",
            message: "The password is incorrect.",
          },
        ],
      };
    }
  }

  @Mutation(() => Boolean)
  logout() {
    return true;
  }

  @Query(() => User, { nullable: true })
  @Authorized()
  me(@Ctx() { payload: { user } }: MyContext) {
    return user;
  }

  @Query(() => User, { nullable: true })
  userById(@Arg("userId") userId: string) {
    return User.findOne(userId);
  }

  @Query(() => User, { nullable: true })
  userByEmail(@Arg("email") email: string) {
    return User.findOne({ where: { email: email.toLowerCase() } });
  }

  @Query(() => User, { nullable: true })
  userByUsername(@Arg("username") username: string) {
    return User.findOne({ where: { rawUsername: username.toLowerCase() } });
  }

  @Query(() => PaginatedUsers, { nullable: true })
  async dummyUsers(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true })
    lastIndex: number
  ) {
    const u = User.createQueryBuilder("u")
      .select("u.*")
      .orderBy({ "u.id": "DESC" }).where(`
        u."isVerified" is not true
      `);

    const { data: users, hasMore } = await paginate<User>({
      queryBuilder: u,
      limit,
      index: "u.id",
      lastIndex,
    });

    return {
      users,
      hasMore,
    };
  }

  @Mutation(() => UserResponse)
  async loginAsDummyUser(
    @Arg("userId", () => Int) userId: number
  ): Promise<UserResponse> {
    const user = await User.findOne(userId);

    if (!user) {
      throw Error("The user is not a dummy user.");
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    return { user, accessToken, refreshToken };
  }
}
