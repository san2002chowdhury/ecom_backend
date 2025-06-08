const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const UserModel = require("./../model/user");
const jwt = require("jsonwebtoken");
exports.authguard = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"].split(" ")[1];
    if (!authorization) {
      throw new Error("User is not authorised");
    } else {
      const payload = await jwt.verify(
        authorization,
        process.env.JWT_SECRET_KEY
      );
      let user = await UserModel.findOne({ _id: payload.id });

      next();
      if (!user) {
        throw new Error("No user found");
      }
    }
  } catch (err) {
    res.status(400).json({
      result: "Some error occured!",
      error: err,
    });
  }
};
