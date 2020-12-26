"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateUser = void 0;
const regexp_1 = require("../utils/regexp");
class ValidateUser {
    constructor(user) {
        this.displayName = user.displayName;
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.displayPicture = user.displayPicture;
        this.coverPicture = user.coverPicture;
    }
    validate() {
        const errors = [];
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
            if (regexp_1.containsSpecialCharacters.test(this.username)) {
                errors.push({
                    field: "username",
                    message: "The username must not contain any special characters like @.",
                });
            }
        }
        if (this.email && !regexp_1.validEmail.test(this.email)) {
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
        if (this.displayPicture && !regexp_1.validUrl.test(this.displayPicture)) {
            errors.push({
                field: "displayPicture",
                message: "The link for display picture must be a valid url.",
            });
        }
        if (this.coverPicture && !regexp_1.validUrl.test(this.coverPicture)) {
            errors.push({
                field: "coverPicture",
                message: "The link for cover picture must be a valid url.",
            });
        }
        return errors;
    }
}
exports.ValidateUser = ValidateUser;
//# sourceMappingURL=user.js.map