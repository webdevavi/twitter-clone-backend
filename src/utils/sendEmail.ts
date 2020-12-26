import nodemailer from "nodemailer";

export const sendEmail = async (to: string, text: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "hllqi45vaj27o6jm@ethereal.email",
      pass: "GeStucsbfhmzMQ4UxV",
    },
  });

  const info = await transporter.sendMail({
    from: '"Quacker - Dev. Avi" <me@devavi.xyz>',
    to,
    subject: subject,
    html: text,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview: ", nodemailer.getTestMessageUrl(info));
};
