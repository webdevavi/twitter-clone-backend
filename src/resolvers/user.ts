import argon from "argon2";
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
import { v4 } from "uuid";
import {
  FORGOT_PASSWORD_PREFIX,
  ORIGIN,
  VERIFY_EMAIL_PREFIX,
} from "../constants";
import { forgotPasswordTemplate } from "../emailTemplates/forgotPassword";
import { verifyEmailTemplate } from "../emailTemplates/verifyEmail";
import { Block } from "../entities/Block";
import { Cache } from "../entities/Cache";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { UserInput } from "../input/UserInput";
import { isAuth } from "../middleware/isAuth";
import { UserResponse } from "../response/UserResponse";
import { MyContext } from "../types";
import { validEmail } from "../utils/regexp";
import { sendEmail } from "../utils/sendEmail";
import { ValidateUser } from "../validators/user";

@Resolver(User)
export class UserResolver {
  @FieldResolver()
  async followers(@Root() user: User) {
    const follows = await Follow.find({ where: { userId: user.id } });
    const followersIds = follows.map((follow) => follow.followerId);
    return await User.findByIds(followersIds);
  }

  @FieldResolver()
  async followings(@Root() user: User) {
    const follows = await Follow.find({ where: { followerId: user.id } });
    const followingsIds = follows.map((follow) => follow.userId);
    return await User.findByIds(followingsIds);
  }

  @FieldResolver()
  quacks(@Root() user: User) {
    return Quack.find({ where: { quackedByUserId: user.id } });
  }

  @FieldResolver()
  requacks(@Root() user: User) {
    return Requack.find({ where: { userId: user.id } });
  }

  @FieldResolver()
  likes(@Root() user: User) {
    return Like.find({ where: { userId: user.id } });
  }

  @FieldResolver(() => Boolean, { nullable: true })
  async haveIBlockedThisUser(@Root() user: User, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const myUserId = req.session.userId;
    if (user.id === myUserId) return null;
    const block = await Block.findOne({
      where: { userId: user.id, blockedByUserId: myUserId },
    });
    if (!block) return false;
    return true;
  }

  @FieldResolver(() => Boolean, { nullable: true })
  async amIBlockedByThisUser(@Root() user: User, @Ctx() { req }: MyContext) {
    //@ts-ignore
    const myUserId = req.session.userId;
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
    @Ctx() { req }: MyContext
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
      await Cache.insert({ key: VERIFY_EMAIL_PREFIX + token, value: user.id });
      const template = verifyEmailTemplate(
        ORIGIN + "/verifyEmail?token=" + token
      );
      await sendEmail(user.email, template, "Verify your email - Quacker");
      //@ts-ignore
      req.session.userId = user.id;
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
        } else {
          throw error;
        }
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("emailOrUsername") emailOrUsername: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
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
      //@ts-ignore
      req.session.userId = user.id;
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
  @UseMiddleware(isAuth)
  async sendEmailVerificationLink(@Ctx() { req }: MyContext) {
    //@ts-ignore
    const user = await User.findOne(req.session.userId);

    if (!user) {
      throw Error("User not found");
    }

    if (user.emailVerified) {
      return false;
    }

    const cache = await Cache.findOne({ where: { value: user.id } });

    let token: string;

    if (cache) {
      token = cache.key.slice(VERIFY_EMAIL_PREFIX.length);
    } else {
      token = v4();
      await Cache.insert({ key: VERIFY_EMAIL_PREFIX + token, value: user.id });
    }

    const template = verifyEmailTemplate(
      ORIGIN + "/verify-email?token=" + token
    );
    await sendEmail(user.email, template, "Verify your email - Quacker");
    return true;
  }

  @Mutation(() => UserResponse)
  async verifyEmail(@Arg("token") token: string): Promise<UserResponse> {
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
    const cache = await Cache.findOne(key);

    if (!cache) {
      return {
        errors: [
          {
            field: "token",
            message: "The token is expired.",
          },
        ],
      };
    }

    const user = await User.findOne(cache.value);

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
    await User.update(
      { id: cache.value },
      {
        emailVerified: true,
      }
    );
    user.emailVerified = true;
    await Cache.delete(key);
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const cache = await Cache.findOne({ where: { value: user.id } });

    let token: string;

    if (cache) {
      token = cache.key.slice(FORGOT_PASSWORD_PREFIX.length);
    } else {
      token = v4();
      await Cache.insert({
        key: FORGOT_PASSWORD_PREFIX + token,
        value: user.id,
      });
    }

    const template = forgotPasswordTemplate(
      ORIGIN + "/reset-password?token=" + token
    );

    await sendEmail(user.email, template, "Reset your password - Quacker");
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = new ValidateUser({ newPassword }).validate();

    if (errors.length !== 0) {
      return { errors };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;

    const cache = await Cache.findOne(key);

    if (!cache) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          },
        ],
      };
    }

    const user = await User.findOne(cache.value);

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
    await User.update({ id: cache.value }, { password: hashedPassword });

    //@ts-ignore
    req.session.userId = user.id;

    await Cache.delete(key);

    return { user };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    //@ts-ignore
    if (!req.session.userId) {
      return null;
    }
    //@ts-ignore
    return User.findOne(req.session.userId);
  }

  @Query(() => User, { nullable: true })
  user(@Arg("userId") userId: string) {
    return User.findOne(userId);
  }
}
