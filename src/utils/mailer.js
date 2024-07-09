import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const sendVerificationMail = async ({ type, email, userId }) => {
  try {
    const token = await bcrypt.hash(userId.toString(), 10);
    if (!token) return;

    if (type === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: token,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else if (type === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: token,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    } else return;

    const transporter = await nodemailer.createTransport({
      pool: true,
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const subject = `Website | ${type === "VERIFY" ? "Verify your email" : "Reset password"}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${type === "VERIFY"}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    padding: 20px;
                }
                .container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .button {
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>${type === "VERIFY" ? "Verify your email" : "Reset password"}</h2>
                <p>Please click the button below to ${type === "VERIFY" ? "verify your email" : "reset your password"}:</p>
                <a href="${process.env.BASE_DOMAIN}/${type === "VERIFY" ? "verify-email" : "reset-password"}?token=${token}">
                    <button class="button">${type === "VERIFY" ? "Verify Email" : "Reset Password"}</button>
                </a>
            </div>
        </body>
        </html>
        `;

    const mailOptions = {
      from: "danishsidd203@gmail.com",
      to: email,
      html,
      subject,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};
