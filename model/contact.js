const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);
const ContactModel = new mongoose.model("contact", contactSchema);
module.exports = ContactModel;
