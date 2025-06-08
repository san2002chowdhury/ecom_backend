const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    status: {
      type: String,
      default: "pending",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);
const CartModel = new mongoose.model("cart", cartSchema);
module.exports = CartModel;
