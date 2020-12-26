import {
  containsSpecialCharacters,
  validEmail,
  validUrl,
} from "../utils/regexp";
import { FieldError } from "../entities/FieldError";

interface IValidateUser {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  displayPicture?: string;
  coverPicture?: string;
}

export class ValidateUser {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  displayPicture?: string;
  coverPicture?: string;

  constructor(user: IValidateUser) {
    this.displayName = user.displayName;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.displayPicture = user.displayPicture;
    this.coverPicture = user.coverPicture;
  }

  validate(): FieldError[] {
    const errors: FieldError[] = [];

    if (this.displayName && this.displayName.length < 3) {
      errors.push({
        field: "displayName",
        message: "The display name must be atleast 3 characters long.",
      });
    }

    if (this.username) {
      if (this.username.length < 3) {
        errors.push({
          field: "username",
          message: "The username must be atleast 3 characters long.",
        });
      }

      if (containsSpecialCharacters.test(this.username)) {
        errors.push({
          field: "username",
          message:
            "The username must not contain any special characters like @.",
        });
      }
    }

    if (this.email && !validEmail.test(this.email)) {
      errors.push({
        field: "email",
        message: "The email must be valid.",
      });
    }

    if (this.password && this.password.length < 6) {
      errors.push({
        field: "password",
        message: "The password must be atleast 6 characters long.",
      });
    }

    if (this.displayPicture && !validUrl.test(this.displayPicture)) {
      errors.push({
        field: "displayPicture",
        message: "The link for display picture must be a valid url.",
      });
    }

    if (this.coverPicture && !validUrl.test(this.coverPicture)) {
      errors.push({
        field: "coverPicture",
        message: "The link for cover picture must be a valid url.",
      });
    }

    return errors;
  }
}
