const mongoose = require("mongoose");
const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const SubscriptionModel = new mongoose.model(
  "subscription",
  subscriptionSchema
);
module.exports = SubscriptionModel;
