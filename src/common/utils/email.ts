import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: "E-Commerce Support <support@khurammirza.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message // You can add HTML later for pretty emails
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};
