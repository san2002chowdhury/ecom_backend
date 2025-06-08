const slugify = require("slugify");
const ProductModel = require("./../model/product");
const { Result } = require("express-validator");
let ObjectId = require("mongodb").ObjectId;

exports.getAll = async (req, res, next) => {
  try {
    let page = req.params.page * 1 || 1;
    let id = req.params.id;
    let filter = req.params.filter;
    let search = req.params.search;
    let query = "";
    let query2 = "";

    const limit = 12;
    const skip = (page - 1) * limit;

    if (id === "All" && search === "All") {
      query = ProductModel.find();
      query2 = ProductModel.find()
        .sort({ price: filter * 1 })
        .skip(skip)
        .limit(limit);
    } else if (id !== "All" && search === "All") {
      query = ProductModel.find({ cat_id: new ObjectId(id) });
      query2 = ProductModel.find({
        cat_id: new ObjectId(id),
      })
        .sort({ price: filter * 1 })
        .skip(skip)
        .limit(limit);
    } else if (id !== "All" && search !== "All") {
      query = ProductModel.find({
        $and: [
          { cat_id: new ObjectId(id) },
          { title: { $regex: search, $options: "im" } },
          { tags: { $regex: search, $options: "im" } },
          { description: { $regex: search, $options: "im" } },
        ],
      });
      query2 = ProductModel.find({
        $and: [
          { cat_id: new ObjectId(id) },
          { title: { $regex: search, $options: "im" } },
          { tags: { $regex: search, $options: "im" } },
          { description: { $regex: search, $options: "im" } },
        ],
      })
        .sort({ price: filter * 1 })
        .skip(skip)
        .limit(limit);
    } else if (id === "All" && search !== "All") {
      query = ProductModel.find({
        $or: [
          { title: { $regex: search, $options: "im" } },
          { tags: { $regex: search, $options: "im" } },
          { description: { $regex: search, $options: "im" } },
        ],
      });
      query2 = ProductModel.find({
        $or: [
          { title: { $regex: search, $options: "im" } },
          { tags: { $regex: search, $options: "im" } },
          { description: { $regex: search, $options: "im" } },
        ],
      })
        .sort({ price: filter * 1 })
        .skip(skip)
        .limit(limit);
    }

    const data = await query;
    const AllProduct = await query2;
    return res.status(200).json({
      status: "success",
      message: "data fetching done successfully",
      Result: AllProduct.length,
      data: AllProduct,
      length: data.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.getSpecificProduct = async (req, res, next) => {
  try {
    let slug = req.params.slug;
    slug = await slugify(slug, {
      replacement: "-",
      remove: /' '/g,
      lower: true,
      trim: true,
    });
    if (slug === " " || slug === null) {
      res.status(404).json({
        status: "fail",
        message: "please enter a specific product name",
      });
    } else {
      const RequestedData = await ProductModel.aggregate([
        { $match: { slug: { $regex: slug, $options: "im" } } },
      ]);
      if (JSON.stringify(RequestedData) !== "[]") {
        res.status(201).json({
          status: "success",
          message: "product search done!",
          Result: RequestedData.length,
          RequestedData,
        });
      } else {
        res.status(401).json({
          status: "fail",
          message: "bad product request!",
        });
      }
    }
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.getTopTenProducts = async (req, res, next) => {
  try {
    const limit = "12";
    const sort = "-rating";
    const topTenProducts = await ProductModel.find().limit(limit).sort(sort);
    res.status(200).json({
      status: "success",
      message: "top 10 products are here!",
      data: topTenProducts,
    });
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.getProductDetails = async (req, res, next) => {
  try {
    const { slug } = req.body;

    const productDetails = await ProductModel.aggregate([
      { $match: { slug: slug } },
      {
        $lookup: {
          from: "categories",
          localField: "cat_id",
          foreignField: "_id",
          as: "data",
        },
      },
      { $unwind: "$data" },
      {
        $set: {
          category_name: "$data.name",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: productDetails,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err,
    });
  }
};
exports.addProduct = async (req, res, next) => {
  try {
    const body = req.body;
    body.slug = await slugify(body.slug, {
      replacement: "-",
      remove: /' '/g,
      lower: true,
      trim: true,
    });
    let image_filename = `${req.file.filename}`;
    const productData = new ProductModel({
      product_image: image_filename,
      price: body.price,
      rating: body.rating,
      tags: body.tags,
      title: body.title,
      slug: body.slug,
      description: body.description,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      user_id: body.user_id,
      cat_id: body.cat_id,
    });
    await productData.save();
    res.status(201).json({
      status: "success",
      message: "product add done!",
      productData,
    });
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Some error occur",
      error: err,
    });
  }
};
exports.deleteProduct = async (req, res, next) => {
  try {
    const body = req.body;
    if (body.title !== "") {
      const deleteDataDetails = await ProductModel.deleteOne({
        title: body.title,
      });
      res.status(200).json({
        status: "success",
        message: "Data Delete  successfully...",
        deleteDataDetails,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Body Is Empty",
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
exports.editProduct = async (req, res, next) => {
  try {
    const title = req.params.title;
    const body = req.body;

    if (body) {
      body.slug = await slugify(body.slug, {
        replacement: "-",
        remove: /' '/g,
        lower: true,
        trim: true,
      });
      const updatedData = await ProductModel.updateOne(
        { title: title },
        {
          $set: {
            title: body.title,
            productBulk_image: body.productBulk_image,
            price: body.price,
            tags: body.tags,
            slug: body.slug,
            summary: body.summary,
            description: body.description,
            discount_type: body.discount_type,
            discount_value: body.discount_value,
          },
        }
      );

      res.status(200).json({
        status: "success",
        message: "Data Update Done",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Body Is Empty",
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

exports.getProduct = async (req, res, next) => {
  try {
    const { key, value, page = 1, limit = 10 } = req.params;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let query = [];
    if (key === "slug") {
      let slug = value;
      slug = await slugify(slug, {
        replacement: "-",
        remove: /' '/g,
        lower: true,
        trim: true,
      });

      query = [
        { $match: { slug: { $regex: slug, $options: "im" } } },
        {
          $unwind: "$category",
        },
        {
          $skip: (pageNumber - 1) * limitNumber,
        },
        {
          $limit: limitNumber,
        },
      ];
    } else if (key === "_id") {
      query = [{ $match: { _id: new ObjectId(value) } }];
    } else if (key === "title") {
      query = [{ $match: { title: value } }];
    } else if (key === "category") {
      query = [
        { $match: { cat_id: new ObjectId(value) } },
        {
          $lookup: {
            from: "categories",
            localField: "cat_id",
            foreignField: "_id",
            as: "data",
          },
        },
      ];
    }

    if (query) {
      const RequestedData = await ProductModel.aggregate(query);
      if (JSON.stringify(RequestedData) !== "[]") {
        res.status(201).json({
          status: "success",
          message: "product search done!",
          Result: RequestedData.length,
          RequestedData,
        });
      } else {
        res.status(401).json({
          status: "fail",
          message: "bad product request!",
        });
      }
    } else {
      const products = await ProductModel.find()
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
      const totalProducts = await ProductModel.countDocuments();
      res.status(201).json({
        status: "Success",
        products,
        pagination: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / limitNumber),
          currentPage: pageNumber,
          perPage: limitNumber,
        },
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
