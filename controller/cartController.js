const { body } = require("express-validator");
const CartModel = require("./../model/cart");
const mongoose = require("mongoose");
const ProductModel = require("../model/product");
let ObjectId = require("mongodb").ObjectId;
exports.addToCart = async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    const isUserPreset = await CartModel.find({
      user_id: new ObjectId(user_id),
    });

    const isProductPresent = await CartModel.find({
      product_id: new ObjectId(product_id),
    });

    let CartData = [];
    if (
      JSON.stringify(isUserPreset) === "[]" &&
      JSON.stringify(isProductPresent) === "[]"
    ) {
      CartData = await CartModel.create({
        user_id: new ObjectId(user_id),
        product_id: new ObjectId(product_id),
        quantity: quantity || 1,
      });
      const currentCart = await CartModel.find({
        user_id: new ObjectId(user_id),
      });
      if (CartData) {
        return res.status(200).json({
          status: "success",
          message: "Product Added in Cart",
          data: currentCart,
          cart_count: currentCart.length,
        });
      } else {
        throw console.error("Some Problem Occurs!");
      }
    }
    if (JSON.stringify(isProductPresent) === "[]" && isUserPreset) {
      CartData = await CartModel.create({
        user_id: new ObjectId(user_id),
        product_id: new ObjectId(product_id),
        quantity: quantity || 1,
      });
      const currentCart = await CartModel.find({
        user_id: new ObjectId(user_id),
      });

      if (CartData) {
        return res.status(200).json({
          status: "success",
          message: "Product Added in Cart",
          data: currentCart,
          cart_count: currentCart.length,
        });
      } else {
        throw console.error("Some Problem Occurs!");
      }
    }
    if (isProductPresent && isUserPreset) {
      CartData = await CartModel.updateOne(
        { product_id: new ObjectId(product_id) },
        { $inc: { quantity: 1 } }
      );
      const currentCart = await CartModel.find({
        user_id: new ObjectId(user_id),
      });

      if (CartData) {
        return res.status(200).json({
          status: "success",
          message: "Product Added in Cart",
          data: currentCart,
          cart_count: currentCart.length,
        });
      } else {
        throw console.error("Some Problem Occurs!");
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.getCartData = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    const cartData = await CartModel.aggregate([
      { $match: { user_id: new ObjectId(user_id) } },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "cart_details",
        },
      },
      { $unwind: "$cart_details" },
      {
        $set: {
          product_name: "$cart_details.title",
          product_price: "$cart_details.price",
          total_price: { $multiply: ["$cart_details.price", "$quantity"] },
          product_image: "$cart_details.product_image",
          slug: "$cart_details.slug",
        },
      },
    ]);
    let cartValue = cartData.reduce(
      (total, item) => total + item.total_price,
      0
    );
    if (cartData) {
      return res.status(200).json({
        status: "success",
        message: "data fetch done!",
        data: cartData,
        cart_count: cartData.length,
        total: cartValue,
      });
    } else {
      throw console.error("User's cart is empty!");
    }
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.updateQunatity = async (req, res, next) => {
  try {
    const { flag, _id, user_id, product_id } = req.body;
    const [{ product_quantity }] = await ProductModel.find({
      _id: new ObjectId(product_id),
    });
    const [{ quantity }] = await CartModel.find({
      _id: new ObjectId(_id),
    });

    if (flag === "inc" && product_quantity > quantity) {
      const data = await CartModel.updateOne(
        {
          $and: [
            { user_id: user_id },
            { product_id: product_id },
            { _id: _id },
          ],
        },
        { $inc: { quantity: 1 } }
      );
      const currentCart = await CartModel.aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "cart_details",
          },
        },
        { $unwind: "$cart_details" },
        {
          $set: {
            product_name: "$cart_details.title",
            product_price: "$cart_details.price",
            total_price: { $multiply: ["$cart_details.price", "$quantity"] },
            product_image: "$cart_details.product_image",
            slug: "$cart_details.slug",
          },
        },
      ]);
      let cartValue = currentCart.reduce(
        (total, item) => total + item.total_price,
        0
      );
      if (data) {
        return res.status(200).json({
          status: "success",
          message: "data fetch done!",
          currentCart: currentCart,
          total: cartValue,
        });
      }
    } else if (flag === "dec") {
      const data = await CartModel.updateOne(
        {
          $and: [
            { user_id: user_id },
            { product_id: product_id },
            { _id: _id },
          ],
        },
        { $inc: { quantity: -1 } }
      );
      const currentCart = await CartModel.aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "cart_details",
          },
        },
        { $unwind: "$cart_details" },
        {
          $set: {
            product_name: "$cart_details.title",
            product_price: "$cart_details.price",
            total_price: { $multiply: ["$cart_details.price", "$quantity"] },
            product_image: "$cart_details.product_image",
            slug: "$cart_details.slug",
          },
        },
      ]);
      let cartValue = currentCart.reduce(
        (total, item) => total + item.total_price,
        0
      );
      if (data) {
        return res.status(200).json({
          status: "success",
          message: "data fetch done!",
          currentCart: currentCart,
          total: cartValue,
        });
      }
    } else if (flag === "inc" && product_quantity === quantity) {
      const currentCart = await CartModel.aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "cart_details",
          },
        },
        { $unwind: "$cart_details" },
        {
          $set: {
            product_name: "$cart_details.title",
            product_price: "$cart_details.price",
            total_price: { $multiply: ["$cart_details.price", "$quantity"] },
            product_image: "$cart_details.product_image",
            slug: "$cart_details.slug",
          },
        },
      ]);
      let cartValue = currentCart.reduce(
        (total, item) => total + item.total_price,
        0
      );
      return res.status(200).json({
        status: "fail",
        message: "You can't add more quantity",
        currentCart: currentCart,
        total: cartValue,
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
exports.removeFromCart = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const data = await CartModel.deleteOne({ _id: new ObjectId(_id) });

    return res.status(200).json({
      status: "success",
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
exports.removeAllFromCart = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const data = await CartModel.deleteMany({ user_id: new ObjectId(user_id) });
    return res.status(200).json({
      status: true,
      message: "All items removed from cart",
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
