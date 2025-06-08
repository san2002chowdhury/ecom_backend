const UserModel = require("./../model/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: "./config.env" });
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { sendMail } = require("../utils/commonEmail");
const { match } = require("assert");
const { options } = require("../routes/contactRoutes");
const upload = require("../utils/imageUpload");
let ObjectId = require("mongodb").ObjectId;
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ==================Handler Function==================
exports.signup = async (req, res, next) => {
  try {
    const body = req.body;
    const emailFound = await UserModel.find({ email: body.email });
    if (JSON.stringify(emailFound) !== "[]") {
      response.status(404).send({
        result: "Email Is Already In DataBase",
      });
    } else {
      body.password = await bcrypt.hash(body.password, 12);
      const data = await UserModel.create({
        email: body.email,
        password: body.password,
        phone: body.phone,
        role: body.role,
        fname: body.fname,
        lname: body.lname,
      });

      const accessToken = signToken(data._id);

      const singupEmailPath = path.join(
        __dirname,
        "../public",
        "signupEmail.html"
      );
      const htmlTemplate = fs.readFileSync(singupEmailPath, "utf-8");

      const myHtml = htmlTemplate.replace("{{name}}", `${body.fname}`);

      await sendMail(
        body.email,
        "Welcome to our store!",
        `Dear ${body.fname}, Thank you for joining CHOWDHURY STORE ptv. ltd.!💚☺️`,
        myHtml
      );
      return res.status(201).json({
        result: "Signup done successfully please login!",
        payload: {
          data,
          accessToken,
        },
      });
    }
  } catch (err) {
    res.status(400).json({
      result: "Some error occured!",
      error: err,
    });
  }
};
exports.login = async (req, res, next) => {
  try {
    const body = req.body;

    if (body.email !== "") {
      const user = await UserModel.findOne({ email: body.email });

      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        return res
          .status(401)
          .json({ message: "You have entered invalid login credentials" });
      }
      const payload = {
        id: user._id,
        name: `${user.fname} ${user.lname}`,
        email: user.email,
        phone: user.phone,
      };

      const accessToken = signToken(payload.id);

      return res.status(200).json({
        result: "Login successfully done ",
        data: payload,
        token: accessToken,
      });
    } else {
      return res.status(401).json({
        message: "Required phone or email",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!",
      error: err,
    });
  }
};

exports.user_data = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (user_id) {
      const data = await UserModel.find({ _id: new ObjectId(user_id) });
      if (data) {
        return res.status(200).json({
          result: "User data fetch successfully",
          data: data,
        });
      } else {
        return res.status(401).json({
          message: "User not found! or some internal issue",
        });
      }
    } else {
      return res.status(401).json({
        message: "User not found! or some internal issue",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.save_data = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.clear();

    let { body } = req.body;

    for (let key in body) {
      if (body[key] === "" || body[key] === null) {
        delete body[key];
      }
    }
    if (id) {
      await UserModel.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: body,
        }
      ).then(async (updatedData) => {
        if (updatedData) {
          console.clear();
          await UserModel.find({ _id: new ObjectId(id) }).then((data) => {
            return res.status(201).json({
              message: "Profile saved successfully!",
              data: data,
              name: `${data[0].fname} ${data[0].lname}`,
            });
          });
        } else {
          return res.status(401).json({
            message: "Profile not saved....internal issue",
          });
        }
      });
    } else {
      return res.status(401).json({
        message: "Profile not saved....internal issue",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!",
      error: err,
    });
  }
};

exports.reset_password = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.clear();

    let { newPassword, confirmPassword } = req.body.body;

    if (!id) {
      throw new Error(
        "Some internal issue from your side please login again!😥"
      );
    }
    if (newPassword === confirmPassword) {
      const password = await bcrypt.hash(newPassword, 12);
      await UserModel.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: { password: password },
        }
      ).then(async (updateData) => {
        if (updateData) {
          return res.status(201).json({
            status: true,
            message: "Your password has been successfully reset 😀",
          });
        } else {
          return res.status(401).json({
            status: false,
            message: "Password can't reset....internal issue",
          });
        }
      });
    } else {
      throw new Error(
        "Some internal issue from your side please login again!😥"
      );
    }
  } catch (error) {
    return res.status(400).json({
      message: "Some error occured!",
      error: error,
    });
  }
};
exports.request_otp = async (req, res, next) => {
  try {
    const { id } = req.body;
    console.clear();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const data = await UserModel.findByIdAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        otp: otp,
        verificationOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      },
      {
        new: true,
      }
    );
    if (!data) {
      throw new Error("Some error occured!");
    }
    const otpEmailPath = path.join(__dirname, "../public", "otp.html");
    const htmlTemplate = fs.readFileSync(otpEmailPath, "utf-8");

    const myHtml = htmlTemplate
      .replace(
        "{{date}}",
        new Date(Date.now()).toString().split(" ").slice(0, 4).join(" ")
      )
      .replace("{{name}}", data.fname)
      .replace("{{otp}}", otp);
    await sendMail(
      data.email,
      "OTP for forgot password!",
      `Dear ${data.fname}, we sent a otp for forgot password please read it properly which valid only for 24 Hours!`,
      myHtml
    );
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully in your mail id! please check",
      otp,
      verificationOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Some error occured!",
      error: error,
    });
  }
};
exports.verify_token = async (req, res, next) => {
  try {
    const { token } = req.body;

    const id = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findOne({ _id: new ObjectId(id) });

    if (!id) {
      throw new Error("Can't recover ID from token");
    } else {
      return res.status(200).json({
        status: "Success",
        id: id,
        data: user,
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!",
      error: err,
    });
  }
};

exports.verify_email = async (req, res, next) => {
  try {
    const { email } = req.body;

    const data = await UserModel.findOne({ email });

    let id = data._id;

    if (data) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const savedData = await UserModel.findByIdAndUpdate(
        {
          _id: new ObjectId(data._id),
        },
        {
          otp: otp,
          verificationOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        },
        {
          new: true,
        }
      );

      const otpEmailPath = path.join(__dirname, "../public", "otp.html");
      const htmlTemplate = fs.readFileSync(otpEmailPath, "utf-8");

      const myHtml = htmlTemplate
        .replace(
          "{{date}}",
          new Date(Date.now()).toString().split(" ").slice(0, 4).join(" ")
        )
        .replace("{{name}}", data.fname)
        .replace("{{otp}}", otp);

      const mailData = await sendMail(
        email,
        "OTP for forgot password!",
        `Dear ${data.fname}, we sent a otp for forgot password please read it properly which valid only for 24 Hours!`,
        myHtml
      );

      return res.status(200).json({
        success: "true",
        message: "OTP sent successfully in your mail id! please check",
        otp,
        id,
        verificationOtpExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!.Please enter a valid email!!",
      error: err,
    });
  }
};

exports.verify_otp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const user = await UserModel.findOne({
      otp: otp,
      verificationOtpExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or expired OTP!",
      });
    }
    user.otp = undefined;
    user.verificationOtpExpiresAt = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "OTP verification done!",
      id: user._id,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!.",
      error: err,
    });
  }
};

exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    let image_filename = `${req.file.filename}`;
    let { id } = req.body;
    await UserModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { profile_photo: image_filename },
      }
    );
    const data = await UserModel.find({ _id: new ObjectId(id) });
    return res.status(200).json({
      result: "User data fetch successfully",
      data: data,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Some error occured!.",
      error: err,
    });
    i;
  }
};
