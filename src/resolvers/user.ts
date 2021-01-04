import argon from "argon2";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { v4 } from "uuid";
import {
  FORGOT_PASSWORD_PREFIX,
  ORIGIN,
  VERIFY_EMAIL_PREFIX,
} from "../constants";
import { forgotPasswordTemplate } from "../emailTemplates/forgotPassword";
import { verifyEmailTemplate } from "../emailTemplates/verifyEmail";
import { Block } from "../entities/Block";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { UserInput } from "../input/UserInput";
import { UserResponse } from "../response/UserResponse";
import { MyContext, UserRole } from "../types";
import { createAccessToken, createRefreshToken } from "../utils/createJWT";
import { validEmail } from "../utils/regexp";
import { sendEmail } from "../utils/sendEmail";
import { ValidateUser } from "../validators/user";

@Resolver(User)
export class UserResolver {
  @FieldResolver()
  followers(@Root() user: User, @Ctx() { followLoaderByUserId }: MyContext) {
    return followLoaderByUserId.load(user.id);
  }

  @FieldResolver()
  followings(
    @Root() user: User,
    @Ctx() { followLoaderByFollowerId }: MyContext
  ) {
    return followLoaderByFollowerId.load(user.id);
  }

  @FieldResolver(() => [Quack], { nullable: true })
  quacks(@Root() user: User) {
    if (user.amIDeactivated) return null;
    return Quack.find({ where: { quackedByUserId: user.id } });
  }

  @FieldResolver(() => [Requack], { nullable: true })
  requacks(@Root() user: User, @Ctx() { requackLoaderByUserId }: MyContext) {
    if (user.amIDeactivated) return null;
    return requackLoaderByUserId.load(user.id);
  }

  @FieldResolver(() => [Like], { nullable: true })
  likes(@Root() user: User, @Ctx() { likeLoaderByUserId }: MyContext) {
    if (user.amIDeactivated) return null;
    return likeLoaderByUserId.load(user.id);
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @Authorized()
  async haveIBlockedThisUser(
    @Root() user: User,
    @Ctx() { payload }: MyContext
  ) {
    const myUserId = payload.user?.id;
    if (user.id === myUserId) return null;
    const block = await Block.findOne({
      where: { userId: user.id, blockedByUserId: myUserId },
    });
    if (!block) return false;
    return true;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  @Authorized()
  async amIBlockedByThisUser(
    @Root() user: User,
    @Ctx() { payload }: MyContext
  ) {
    const myUserId = payload.user?.id;
    if (user.id === myUserId) return null;
    const block = await Block.findOne({
      where: { userId: myUserId, blockedByUserId: user.id },
    });
    if (!block) return false;
    return true;
  }

  @Mutation(() => UserResponse)
  async signup(
    @Arg("input") input: UserInput,
    @Ctx() { cache }: MyContext
  ): Promise<UserResponse> {
    const errors = new ValidateUser(input).validate();

    if (errors.length !== 0) {
      return { errors };
    }

    const { displayName, username, email, password } = input;

    const hashedPassword = await argon.hash(password);

    const user = User.create({
      displayName,
      username,
      email,
      password: hashedPassword,
    });

    try {
      await user.save();
      const token = v4();
      const key = VERIFY_EMAIL_PREFIX + token;
      await cache.set(
        key,
        user.id,
        "ex",
        1000 * 60 * 60 * 24 * 3 // 3 days
      );
      const template = verifyEmailTemplate(
        ORIGIN + "/verifyEmail?token=" + token
      );
      await sendEmail(user.email, template, "Verify your email - Quacker");
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
        } else if (error.detail.includes("username")) {
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
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
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

  @Mutation(() => Boolean)
  @Authorized<UserRole>(["UNVERIFIED"])
  async sendEmailVerificationLink(
    @Ctx() { payload: { user }, cache }: MyContext
  ) {
    const token = v4();
    const key = VERIFY_EMAIL_PREFIX + token;

    await cache.set(
      key,
      user!.id,
      "ex",
      1000 * 60 * 60 * 24 * 3 // 3 days
    );

    const template = verifyEmailTemplate(
      ORIGIN + "/verify-email?token=" + token
    );
    await sendEmail(user?.email!, template, "Verify your email - Quacker");
    return true;
  }

  @Mutation(() => UserResponse)
  async verifyEmail(
    @Arg("token") token: string,
    @Ctx() { cache }: MyContext
  ): Promise<UserResponse> {
    if (!token) {
      return {
        errors: [
          {
            field: "token",
            message: "The token is required.",
          },
        ],
      };
    }

    const key = VERIFY_EMAIL_PREFIX + token;
    const userId = await cache.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "The token is expired.",
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists.",
          },
        ],
      };
    }

    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }
    await cache.del(VERIFY_EMAIL_PREFIX + token);
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { cache }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();
    const key = FORGOT_PASSWORD_PREFIX + token;

    await cache.set(
      key,
      user!.id,
      "ex",
      1000 * 60 * 60 * 24 // 24 hours
    );

    const template = forgotPasswordTemplate(
      ORIGIN + "/reset-password?token=" + token
    );

    await sendEmail(user.email, template, "Reset your password - Quacker");
    return true;
  }

  @Mutation(() => UserResponse)
  async changePasswordWithToken(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { cache }: MyContext
  ): Promise<UserResponse> {
    const errors = new ValidateUser({ newPassword }).validate();

    if (errors.length !== 0) {
      return { errors };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;

    const userId = await cache.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists.",
          },
        ],
      };
    }

    const hashedPassword = await argon.hash(newPassword);

    user.password = hashedPassword;
    await User.update({ id: userId }, { password: hashedPassword });

    await cache.del(key);

    return { user };
  }

  @Mutation(() => UserResponse)
  @Authorized<UserRole>(["ACTIVATED"])
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

  @Mutation(() => UserResponse, { nullable: true })
  @Authorized<UserRole>(["ACTIVATED"])
  async deactivate(
    @Arg("password") password: string,
    @Ctx() { payload: { user } }: MyContext
  ): Promise<UserResponse> {
    if (await argon.verify(user!.password, password)) {
      user!.amIDeactivated = true;
      await user!.save();
      await Quack.update({ quackedByUserId: user?.id }, { isVisible: false });
      return { user };
    } else {
      return {
        errors: [{ field: "password", message: "The password is incorrect." }],
      };
    }
  }

  @Mutation(() => UserResponse, { nullable: true })
  @Authorized<UserRole>(["DEACTIVATED"])
  async activate(
    @Ctx() { payload: { user } }: MyContext
  ): Promise<UserResponse> {
    user!.amIDeactivated = false;
    await user!.save();
    await Quack.update({ quackedByUserId: user?.id }, { isVisible: true });

    return { user };
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
    return User.findOne({ email });
  }

  @Query(() => User, { nullable: true })
  userByUsername(@Arg("username") username: string) {
    return User.findOne({ username });
  }
}
