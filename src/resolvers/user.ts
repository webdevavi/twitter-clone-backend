import argon from "argon2";
import {
  DEFAULT_CP,
  DEFAULT_DP,
  FORGOT_PASSWORD_PREFIX,
  ORIGIN,
  VERIFY_EMAIL_PREFIX,
} from "../constants";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entities/User";
import { UserResponse } from "../entities/UserResponse";
import { UserInput } from "../input/UserInput";
import { MyContext } from "../types";
import { validEmail } from "../utils/regexp";
import { ValidateUser } from "../validators/user";
import { sendEmail } from "../utils/sendEmail";
import { verifyEmailTemplate } from "../emailTemplates/verifyEmail";
import { v4 } from "uuid";
import { Cache } from "../entities/Cache";
import { isAuth } from "../middleware/isAuth";
import { forgotPasswordTemplate } from "../emailTemplates/forgotPassword";

@Resolver(User)
export class UserResolver {
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
      emailVerified: false,
      displayPicture: DEFAULT_DP,
      coverPicture: DEFAULT_CP,
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
}
