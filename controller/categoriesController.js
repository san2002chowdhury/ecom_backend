const slugify = require("slugify");
const CategoryModel = require("./../model/categories");
const { Result } = require("express-validator");
exports.allCategories = async (req, res, next) => {
  try {
    const allCategories = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "cat_id",
          as: "category_data",
        },
      },
      {
        $project: { name: 1, category_data: 1 },
      },
      {
        $addFields: {
          category_data: ["$category_data"],
        },
      },
      {
        $unwind: "$category_data",
      },
      {
        $project: {
          name: 1,
          productCount: { $size: "$category_data" },
        },
      },

      {
        $sort: { productCount: -1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      message: "data fetching done successfully",
      Result: allCategories.length,
      data: allCategories,
    });
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.addCategory = async (req, res, next) => {
  try {
    const body = req.body;
    const categoryFound = await CategoryModel.find({ name: body.name });

    if (JSON.stringify(categoryFound) !== "[]") {
      res.status(404).json({
        status: "bad entry",
        message: "category already exist in DB",
      });
    } else {
      body.slug = await slugify(body.slug, {
        replacement: "-",
        remove: /' '/g,
        lower: true,
        trim: true,
      });
      let image_filename = `${req.file.filename}`;
      const categoriesData = new CategoryModel({
        slug: body.slug,
        name: body.name,
        tags: body.tags,
        cat_img: image_filename,
        user_id: body.user_id,
      });
      await categoriesData.save();

      res.status(201).json({
        status: "success",
        categoriesData,
      });
    }
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};

exports.topCategories = async (req, res, next) => {
  try {
    const topCategories = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "cat_id",
          as: "category_data",
        },
      },
      {
        $project: { name: 1, category_data: 1 },
      },
      {
        $addFields: {
          category_data: ["$category_data"],
        },
      },
      {
        $unwind: "$category_data",
      },
      {
        $project: {
          name: 1,
          productCount: { $size: "$category_data" },
        },
      },

      {
        $sort: { productCount: -1 },
      },
      {
        $limit: 4,
      },
    ]);

    res.status(200).json({
      status: "Data Fetched Done",
      data: topCategories,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occurs",
      error: error,
    });
  }
};
