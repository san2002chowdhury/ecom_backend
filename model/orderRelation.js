const mongoose = require("mongoose");
const orderRelationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "orders",
  },
  status: {
    type: String,
  },
});
const OrderRelationModel = new mongoose.model(
  "orderRelation",
  orderRelationSchema
);
module.exports = OrderRelationModel;
