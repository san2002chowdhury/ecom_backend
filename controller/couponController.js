const mongoose = require("mongoose");
const CouponModel = require("../model/couponModel");
const OrderModel = require("../model/order");
const UserModel = require("../model/user");
let ObjectId = require("mongodb").ObjectId;
exports.couponCreate = async (req, res, next) => {
  try {
    const { coupon_name, code, mode, amount, status } = req.body;
    const CouponData = await CouponModel.create({
      coupon_name: coupon_name,
      code: code,
      mode: mode,
      amount: amount,
      status: status,
    });
    return res.status(200).json({
      status: true,
      message: "Coupon created!",
      data: CouponData,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.couponUse = async (req, res, next) => {
  try {
    const { code, user_id, cart_data } = req.body;

    let total_price = cart_data.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.total_price;
    }, 0);
    const data = await CouponModel.find({
      code,
    });
    if (JSON.stringify(data) === "[]") {
      return res.status(200).json({
        status: false,
        message: "Coupon does'nt exists!",
        data: cart_data,
        price: total_price,
        code: "",
        _id: "",
        minCartValue: 0,
      });
    } else {
      const [{ code, status, amount, use, _id, mode, minCartValue }] = data;
      if (status === "active") {
        console.log("id", _id);

        const isNew = await OrderModel.findOne({
          $and: [
            { user_id: new ObjectId(user_id) },
            { coupond_id: new ObjectId(_id) },
          ],
        });

        console.log("IS New", isNew);

        if (JSON.stringify(isNew) === "[]" && use === "One") {
          if (mode === "%" && total_price >= minCartValue) {
            total_price = total_price - (total_price * amount) / 100;

            return res.status(200).json({
              status: true,
              message: `Coupon used successfully 😀`,
              data: cart_data,
              price: total_price,
              code: code,
              _id: _id,
              minCartValue: minCartValue,
            });
          } else if (mode === "-" && total_price >= minCartValue) {
            total_price = total_price - amount;
            return res.status(200).json({
              status: true,
              message: `Coupon used successfully 😀`,
              data: cart_data,
              price: total_price,
              code: code,
              _id: _id,
              minCartValue: minCartValue,
            });
          } else {
            return res.status(200).json({
              status: false,
              message: `Add ₹${
                minCartValue - total_price
              } item to avail this ${code}`,
              data: cart_data,
              price: total_price,
              code: "",
              _id: "",
              minCartValue: 0,
            });
          }
        } else if (
          use === "Mul"
          // && total_price >= minCartValue
        ) {
          if (mode === "%" && total_price >= minCartValue) {
            total_price = total_price - (total_price * amount) / 100;

            return res.status(200).json({
              status: true,
              message: `Coupon used successfully 😀`,
              data: cart_data,
              price: total_price,
              code: code,
              _id: _id,
              minCartValue: minCartValue,
            });
          } else if (mode === "-" && total_price >= minCartValue) {
            total_price = total_price - amount;
            return res.status(200).json({
              status: true,
              message: `Coupon used successfully 😀`,
              data: cart_data,
              price: total_price,
              code: code,
              _id: _id,
              minCartValue: minCartValue,
            });
          } else {
            console.log("We Here-->Some more items add-->");

            return res.status(200).json({
              status: false,
              message: `Add ₹${
                minCartValue - total_price
              } item to avail this "${code}"`,
              data: cart_data,
              price: total_price,
              code: "",
              _id: "",
              minCartValue: 0,
            });
          }
        } else {
          console.log("We Here-->Cant Avail-->");

          return res.status(200).json({
            status: false,
            message: `You can't avail this '${code}' coupon code!`,
            data: cart_data,
            price: total_price,
            code: "",
            _id: "",
            minCartValue: 0,
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          message: "Coupon expired!",
          data: cart_data,
          price: total_price,
          code: "",
          _id: "",
          minCartValue: 0,
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
