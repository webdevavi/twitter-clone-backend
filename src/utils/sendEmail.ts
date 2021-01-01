import nodemailer from "nodemailer";
import {
  NODE_MAILER_HOST,
  NODE_MAILER_PASSWORD,
  NODE_MAILER_PORT,
  NODE_MAILER_USER,
} from "../constants";

export const sendEmail = async (to: string, text: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: NODE_MAILER_HOST,
    port: parseInt(NODE_MAILER_PORT!),
    auth: {
      user: NODE_MAILER_USER,
      pass: NODE_MAILER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Quacker - Dev. Avi" <me@devavi.xyz>',
    to,
    subject: subject,
    html: text,
  });

  console.log("Message sent: %s", info.messageId);
};
