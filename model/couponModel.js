const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
  coupon_name: {
    type: String,
  },
  code: {
    type: String,
  },
  mode: {
    type: String,
  },
  amount: {
    type: Number,
  },
  status: {
    type: String,
  },
  use: {
    type: String,
  },
  minCartValue: {
    type: Number,
  },
});
const CouponModel = new mongoose.model("coupon", couponSchema);
module.exports = CouponModel;
