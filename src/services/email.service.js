import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,

        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error(
            "Error connecting to email server:",
            error
        );
    } else {
        console.log(
            "Email server is ready to send messages"
        );
    }
});

// Send Email Function
export const sendEmail = async (
    to,
    subject,
    text,
    html
) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your App" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log(
            "Message sent:",
            info.messageId
        );

    } catch (error) {
        console.error(
            "Error sending email:",
            error
        );
    }
};

export default transporter;