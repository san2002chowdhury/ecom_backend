const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  order_status: {
    type: String,
  },
  paymentGateway_refno: {
    type: String,
  },
  payment_date: {
    type: date,
  },
  payment_status: {
    type: String,
  },
});
const PaymentModel = new mongoose.model("payment", paymentSchema);
module.exports = PaymentModel;
