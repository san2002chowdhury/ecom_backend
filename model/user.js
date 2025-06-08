const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlenght: 30,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      maxlength: 10,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    fname: {
      type: String,
      require: true,
    },
    mname: {
      type: String,
    },
    lname: {
      type: String,
      require: true,
    },
    alternatePhone: {
      type: String,
      maxlength: 10,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    nearestLandmark: {
      type: String,
      default: "",
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    state: {
      type: String,
    },
    dob: {
      type: String,
    },
    country: {
      type: String,
    },
    profile_photo: {
      type: String,
    },
    otp: String,
    verificationOtpExpiresAt: Date,
  },
  { timestamps: true }
);
const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
