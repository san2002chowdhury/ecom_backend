const mongoose = require("mongoose");
const PaymentModel = require("../model/payment");
let ObjectId = require("mongodb").ObjectId;
exports.paymentDone = async (req, res, next) => {
  try {
    const {
      order_id,
      user_id,
      order_status,
      paymentGateway_refno,
      payment_date,
      payment_status,
    } = req.body;
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
