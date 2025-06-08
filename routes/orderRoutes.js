const express = require("express");
const router = express.Router();
const OrderController = require("./../controller/orderController");
const Authguard = require("../guards/authguard");
router
  .route("/placeOrder")
  .post(Authguard.authguard, OrderController.placeOrder);

router.route("/getAll").post(OrderController.getOrderDetails);
router
  .route("/processPayment")
  .post(Authguard.authguard, OrderController.processPayment);
router.route("/getKey").get(OrderController.getKey);
router
  .route("/order-confirm")
  .post(Authguard.authguard, OrderController.orderConfirm);
router
  .route("/order-failed")
  .post(Authguard.authguard, OrderController.orderFailed);

router.route("/getPdf").get(OrderController.pdfGenerate);
module.exports = router;
