const express = require("express");
const router = express.Router();
const CartController = require("./../controller/cartController");
const Authguard = require("../guards/authguard");
router.route("/add").post(Authguard.authguard, CartController.addToCart);
router.route("/updateQuantity").patch(CartController.updateQunatity);
router.route("/cartData").post(CartController.getCartData);
router.route("/remove").delete(CartController.removeFromCart);
router
  .route("/removeAll")
  .delete(Authguard.authguard, CartController.removeAllFromCart);
module.exports = router;
