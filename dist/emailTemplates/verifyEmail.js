"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = void 0;
const verifyEmailTemplate = (link) => `
    <h2>Welcome to Quacker</h2>
    <hr>
    <p>Thanks for signing up with Quacker, now in order to start using Quacker, you need to verify your email with us.</p>
    <br>
    <a href="${link}">Verify Email</a>
`;
exports.verifyEmailTemplate = verifyEmailTemplate;
//# sourceMappingURL=verifyEmail.js.map