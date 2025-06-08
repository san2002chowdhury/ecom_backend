const express = require("express");
const router = express.Router();
const CouponController = require("./../controller/couponController");
router.route("/addCoupon").post(CouponController.couponCreate);
router.route("/useCoupon").post(CouponController.couponUse);

module.exports = router;
