const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupons",
    },
    product: {
      type: [],
    },

    totalPrice: {
      type: Number,
    },
    payment_mode: {
      type: String,
    },
    payment_status: {
      type: String,
    },
    order_date: {
      type: String,
    },
    order_status: {
      type: String,
    },
    order_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel = new mongoose.model("order", orderSchema);
module.exports = OrderModel;
