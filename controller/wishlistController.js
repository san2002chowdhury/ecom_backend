const WishlistModel = require("../model/wishlist");

let ObjectId = require("mongodb").ObjectId;
exports.addToWishlist = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.body;

    let isProductPreset = await WishlistModel.find({
      product_id: new ObjectId(product_id),
    });

    if (JSON.stringify(isProductPreset) === "[]") {
      const wishlistData = await WishlistModel.create({
        user_id: new ObjectId(user_id),
        product_id: new ObjectId(product_id),
      });
      const currentWishlist = await WishlistModel.find({ user_id: user_id });

      return res.status(200).json({
        status: "success",
        message: "Product Added in Wishlist",
        data: currentWishlist,
        wishlistCount: currentWishlist.length,
      });
    }
    if (JSON.stringify(isProductPreset) !== "[]") {
      return res.status(200).json({
        status: "fail",
        message: "You can't add same product on wishlist more than one time",
      });
    }
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.wishlistData = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    const wishlist_data = await WishlistModel.aggregate([
      { $match: { user_id: new ObjectId(user_id) } },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_data",
        },
      },
      { $unwind: "$product_data" },
      {
        $set: {
          product_img: "$product_data.product_image",
          product_name: "$product_data.title",
          slug: "$product_data.slug",
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "data fetch done!",
      data: wishlist_data,
      wishlistCount: wishlist_data.length,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (_id) {
      const data = await WishlistModel.deleteOne({
        _id: new ObjectId(_id),
      });
      return res.status(204).json({
        status: "success",
        data,
      });
    }
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};

exports.removeAllFromWishlist = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const data = await WishlistModel.deleteMany({
      user_id: new ObjectId(user_id),
    });
    return res.status(200).json({
      status: true,
      message: "All items removed from wishlist",
      data,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
