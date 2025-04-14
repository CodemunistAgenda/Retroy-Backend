import "dotenv/config.js";
import sgMail from "@sendgrid/mail";

const api = process.env.SEND_GRID_APIKEY;

sgMail.setApiKey(api || "");

interface Message {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export const sendVerficationEmail = async (email: string, token: string) => {
  const message = {
    to: email,
    from: process.env.ADMIN_EMAIL,
    subject: "Welcome to Retroy, please verify your email",
    // beachte das hier die URL geändert werden
    html: `Click the link below, to become a verfied user of Retroy:\n\nhttp://localhost:${process.env.PORT}/api/auth/verify?token=${token}`,
  };

  try {
    await sgMail.send(message as Message);
    console.log("Verification email sendet to, " + email);
  } catch (err) {
    console.error("Error sending email: ", err);
    throw new Error("Error sending email");
  }
};

export const warningMail = async (subject: string, warning: string) => {
  const options = {
    to: process.env.SYSTEM_HOST,
    from: process.env.ADMIN_EMAIL,
    subject: subject,
    html: warning,
  };

  try {
    await sgMail.send(options as Message);
    console.log("System reacted admin is warned");
  } catch (e) {
    console.error("Error sending warning email: ", e);
    throw new Error("Error sending warning email");
  }
};
