const express = require("express");
const router = express.Router();
const Authguard = require("../guards/authguard");
const WishlistController = require("../controller/wishlistController");
router
  .route("/add")
  .post(Authguard.authguard, WishlistController.addToWishlist);
router.route("/data").post(WishlistController.wishlistData);
router.route("/remove").delete(WishlistController.removeFromWishlist);
router
  .route("/removeAll")
  .delete(Authguard.authguard, WishlistController.removeAllFromWishlist);
module.exports = router;
