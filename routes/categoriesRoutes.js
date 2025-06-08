const express = require("express");
const router = express.Router();
const multer = require("multer");
const CategoryController = require("./../controller/categoriesController");
const upload = require("../utils/imageUpload");
router
  .route("/add")
  .post(upload.single("cat_img"), CategoryController.addCategory);
router.route("/").get(CategoryController.allCategories);
router.route("/top5").get(CategoryController.topCategories);

module.exports = router;
