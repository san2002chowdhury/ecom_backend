const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
    },
    cat_img: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);
const CategoryModel = new mongoose.model("categories", categorySchema);
module.exports = CategoryModel;
