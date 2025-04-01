import nodemailer from "nodemailer";

export const sendVerficationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  const options = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Welcome to Retroy, please verify your email",
    // beachte das hier die URL geändert werden
    text: `Click the link below, to become a verfied user of Retroy:\n\nhttp://localhost:${process.env.PORT}/api/auth/verify?token=${token}`,
  };

  try {
    await transporter.sendMail(options);
    console.log("Verification email sendet to, " + email);
  } catch (err) {
    console.error("Error sending email: ", err);
    throw new Error("Error sending email");
  }
};
