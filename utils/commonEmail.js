const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { content } = require("googleapis/build/src/apis/content");
dotenv.config({ path: "./config.env" });

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
exports.sendMail = async (To, SUBJECT, TEXT, HTML, CONTENT = "") => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "chowdhurystore2025@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: "CHOWDHURY_STORE 📧 <chowdhurystore2025@gmail.com>",
      to: To,
      subject: SUBJECT,
      text: TEXT,
      html: HTML,
      attachments: [
        {
          filename: "Logo.png",
          path: path.join(__dirname, "../public/Logo.png"),
          cid: "logo",
        },
        {
          filename: "invoice.pdf",
          content: CONTENT,
          contentType: "application/pdf",
        },
      ],
    };
    const mailData = await transport.sendMail(mailOptions);
    return mailData;
  } catch (error) {
    return error;
  }
};
