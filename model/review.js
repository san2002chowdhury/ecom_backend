const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    rating: {
      type: Number,
      default: 2,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  },
  { timestamps: true }
);
const ReviewModel = new mongoose.model("reviews", reviewSchema);
module.exports = ReviewModel;
