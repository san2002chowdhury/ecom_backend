const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    product_image: {
      type: String,
    },
    product_quantity: {
      type: Number,
      require: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 3,
    },
    discount_type: {
      type: String,
    },
    discount_value: {
      type: String,
    },
    tags: {
      type: [String],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    cat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
  },
  { timestamps: true }
);
const ProductModel = new mongoose.model("products", productSchema);
module.exports = ProductModel;
