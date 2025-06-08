const path = require("path");
const fs = require("fs");
const ContactModel = require("./../model/contact");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { sendMail } = require("../utils/commonEmail");
const SubscriptionModel = require("../model/subscription");
dotenv.config({ path: "./config.env" });

exports.getContact = async (req, res, next) => {
  try {
    const contactEmailPath = path.join(__dirname, "../public", "contact.html");
    const htmlTemplate = fs.readFileSync(contactEmailPath, "utf-8");

    const { name, email, message } = req.body;
    if (name && email && message) {
      await ContactModel.create({
        name: name,
        email: email,
        message: message,
      });
      const user_name = name.split(" ")[0];

      const myHtml = htmlTemplate.replaceAll("{{name}}", user_name);

      const mailData = await sendMail(
        email,
        `Thank You! ${user_name}, For Connect With Us😁💚`,
        "",
        myHtml
      );

      if (mailData) {
        res.status(200).json({
          status: "success",
          message: `Thanks ${user_name}! for connecting with us, please check your mail.`,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Missing required fields: name, email, or message.",
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.subscribeNewsLetter = async (req, res, next) => {
  try {
    const subscribeEmailPath = path.join(
      __dirname,
      "../public",
      "subscribe.html"
    );
    const htmlTemplate = fs.readFileSync(subscribeEmailPath, "utf-8");

    const { inputEmail } = req.body;
    if (inputEmail) {
      await SubscriptionModel.create({
        email: inputEmail,
      });
      const myHtml = htmlTemplate.replaceAll("{{email}}", inputEmail);
      const mailData = await sendMail(
        inputEmail,
        `Thank You! For Subscribing Us😁💚`,
        "",
        myHtml
      );
      if (mailData) {
        return res.status(200).json({
          status: "success",
          message: `Thanks for subscribing us, please check your mail.`,
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: name, email, or message.",
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
