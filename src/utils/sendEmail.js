import transporter from "../config/mailer.js";

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  return transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    html,
  });
};