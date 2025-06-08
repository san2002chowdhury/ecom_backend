const express = require("express");
const router = express.Router();
const ProductController = require("./../controller/productController");
const upload = require("../utils/imageUpload");
router
  .route("/add")
  .post(upload.single("product_image"), ProductController.addProduct);
router.route("/getOne/:slug").get(ProductController.getSpecificProduct);

router
  .route("/products/:page/:id/:filter/:search")
  .get(ProductController.getAll);
router.route("/").post(ProductController.getProductDetails);
router.route("/topten").get(ProductController.getTopTenProducts);
router.route("/delete").delete(ProductController.deleteProduct);
router.route("/edit/:title").patch(ProductController.editProduct);
module.exports = router;
