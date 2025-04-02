import axios from "axios";

export const humanVerification = async (token: string): Promise<boolean> => {
  const sectretKey = process.env.CAPTCHA_SECRET_KEY as string;

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      `secret=${sectretKey}&response=${token}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("Captcha response:", response.data);

    return response.data.success && response.data.score > 0.5; // unter 0.5 ist es ein Bot
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
};
