"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const constants_1 = require("../constants");
const sendEmail = (to, text, subject) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: constants_1.NODE_MAILER_HOST,
        port: parseInt(constants_1.NODE_MAILER_PORT),
        auth: {
            user: constants_1.NODE_MAILER_USER,
            pass: constants_1.NODE_MAILER_PASSWORD,
        },
    });
    const info = yield transporter.sendMail({
        from: '"Quacker - Dev. Avi" <me@devavi.xyz>',
        to,
        subject: subject,
        html: text,
    });
    console.log("Message sent: %s", info.messageId);
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map