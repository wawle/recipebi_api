import nodemailer from "nodemailer";

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT as any,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(config);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.SITE_MAIL_RECIEVER}>`,
    to: options.email || process.env.SITE_MAIL_RECIEVER,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};
