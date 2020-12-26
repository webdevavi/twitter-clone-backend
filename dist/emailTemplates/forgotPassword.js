"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordTemplate = void 0;
const forgotPasswordTemplate = (link) => `
    <h2>Reset your password</h2>
    <hr>
    <p>Looks like you have forgotten your password, in order to change your password, go the link</p>
    <br>
    <a href="${link}">Change Password</a>
`;
exports.forgotPasswordTemplate = forgotPasswordTemplate;
//# sourceMappingURL=forgotPassword.js.map