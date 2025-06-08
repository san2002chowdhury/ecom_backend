const OrderModel = require("../model/order");
const OrderRelationModel = require("../model/orderRelation");
const ProductModel = require("../model/product");
const ReviewModel = require("./../model/review");
const mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectId;
exports.giveReview = async (req, res, next) => {
  try {
    const { description, rating, user_id, product_id } = req.body;

    const orderData = await OrderRelationModel.find({
      $and: [
        { user_id: new ObjectId(user_id) },
        { product_id: new ObjectId(product_id) },
        { status: "delivered" },
      ],
    });

    if (orderData.length >= 1) {
      const totalReview = await ReviewModel.find({
        product_id: new ObjectId(product_id),
      });
      const [productData] = await ProductModel.find({
        _id: new ObjectId(product_id),
      });
      const isPresent = await ReviewModel.find({
        $and: [
          { user_id: new ObjectId(user_id) },
          {
            product_id: new ObjectId(product_id),
          },
        ],
      });
      if (isPresent.length === 1) {
        return res.status(200).json({
          status: "false",
          message: "You can't post review more than one time!",
          data: "",
        });
      } else {
        await ReviewModel.create({
          user_id: new ObjectId(user_id),
          product_id: new ObjectId(product_id),
          description: description,
          rating: rating,
        });
        const updatedRating = Math.min(
          5.0,
          (productData.rating + rating) / (totalReview.length + 1)
        );
        await ProductModel.updateOne(
          {
            _id: new ObjectId(product_id),
          },
          {
            rating: updatedRating,
          }
        );
        const reviewData = await ReviewModel.aggregate([
          { $match: { product_id: new ObjectId(product_id) } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $unwind: "$users",
          },
          {
            $project: {
              _id: 1,
              description: 1,
              rating: 1,
              product_id: 1,
              createdAt: 1,
              name: { $concat: ["$users.fname", " ", "$users.lname"] },
              profile_photo: "$users.profile_photo" || "",
            },
          },
        ]);
        return res.status(200).json({
          status: "true",
          message: "Your review added successfully!",
          data: reviewData,
        });
      }
    } else {
      return res.status(200).json({
        status: "false",
        message: "Only buyers can review the product!",
        data: "",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.getDetails = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const reviewData = await ReviewModel.aggregate([
      { $match: { product_id: new ObjectId(product_id) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: "$users",
      },
      {
        $project: {
          _id: 1,
          description: 1,
          rating: 1,
          product_id: 1,
          createdAt: 1,
          name: { $concat: ["$users.fname", " ", "$users.lname"] },
          profile_photo: "$users.profile_photo" || "",
        },
      },
    ]);

    return res.status(200).json({
      data: reviewData,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err,
    });
  }
};
