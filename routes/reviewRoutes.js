const express = require("express");
const router = express.Router();
const ReviewController = require("./../controller/reviewController");
router.route("/addReview").post(ReviewController.giveReview);
router.route("/reviewDetails").post(ReviewController.getDetails);
module.exports = router;
