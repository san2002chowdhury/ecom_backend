const { body, check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const Authguard = require("./../guards/authguard");
const UserController = require("./../controller/userController");
const { route } = require("../app");
const upload = require("../utils/imageUpload");
router.route("/signup").post(
  [
    body("email", "Invalid Email").isEmail(),
    check("fname").not().isEmpty().withMessage("Name is Mandetory"),
    check("lname").not().isEmpty().withMessage("Name is Mandetory"),
    check("phone").not().isEmpty().withMessage("phone number is Mandetory"),
    check("password").not().isEmpty().withMessage("password is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("pasword should be min 6 length"),
    body("password")
      .isLength({ max: 16 })
      .withMessage("password should be max 16 length"),
  ],
  async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        msg: errors.array(),
      });
    } else {
      next();
    }
  },
  UserController.signup
);
router.route("/login").post(
  [
    check("password").not().isEmpty().withMessage("Password is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        msg: errors.array(),
      });
    } else {
      next();
    }
  },
  UserController.login
);

router.route("/user_details").post(UserController.user_data);
router
  .route("/save_profile/:id")
  .patch(Authguard.authguard, UserController.save_data);
router
  .route("/reset_password/:id")
  .patch(Authguard.authguard, UserController.reset_password);
router.route("/verify_token").post(UserController.verify_token);
router.route("/verify_email").post(UserController.verify_email);
router.route("/request_otp").post(UserController.request_otp);
router.route("/verify_otp").post(UserController.verify_otp);
router.route("/forgot_password/:id").patch(UserController.reset_password);

router
  .route("/profile_photo")
  .post(upload.single("profile_photo"), UserController.uploadProfilePhoto);
module.exports = router;
