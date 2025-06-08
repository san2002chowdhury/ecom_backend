const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const OrderModel = require("../model/order");
const moment = require("moment");
const UserModel = require("../model/user");
const { sendPdf } = require("../utils/commonPdf");
const { sendMail } = require("../utils/commonEmail");
const ProductModel = require("../model/product");
const OrderRelationModel = require("../model/orderRelation");
const CouponModel = require("../model/couponModel");

let ObjectId = require("mongodb").ObjectId;
dotenv.config({ path: "./config.env" });
exports.placeOrder = async (req, res, next) => {
  try {
    const orderEmailPath = path.join(
      __dirname,
      "../public",
      "orderConfirm.html"
    );
    const htmlTemplate = fs.readFileSync(orderEmailPath, "utf-8");
    const {
      user_id,
      coupon_id,
      cart_data,
      totalPrice,
      payment_mode,
      order_status,
    } = req.body;

    const formattedDate = moment().format("D MMMM, YYYY [at] h:mm A");
    const order_id = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")}`;
    const userData = await UserModel.find({ _id: new ObjectId(user_id) });
    const OrderData = await OrderModel.create({
      user_id: new ObjectId(user_id),
      coupon_id: coupon_id || undefined,
      product: cart_data,
      totalPrice: totalPrice,
      payment_mode: payment_mode,
      payment_status: "due",
      order_date: formattedDate,
      order_status: order_status,
      order_id: order_id,
    });

    for (const item of cart_data) {
      await ProductModel.updateOne(
        { _id: new ObjectId(item.product_id) },
        {
          $inc: {
            product_quantity: parseInt(-item.quantity),
          },
        }
      );
      await OrderRelationModel.create({
        user_id: new ObjectId(user_id),
        product_id: new ObjectId(item.product_id),
        order_id: new ObjectId(OrderData._id),
        status: "processing",
      });
    }
    const { product } = OrderData;
    const pdfBuffer = await sendPdf(OrderData);
    const myHtml = htmlTemplate
      .replace("{{name}}", userData[0].fname)
      .replace("{{orderID}}", OrderData.order_id)
      .replace("{{orderValue}}", OrderData.totalPrice);
    await sendMail(
      userData[0].email,
      `Order Confirmed!`,
      `Thank You! ${userData[0].fname}, for your purchase from us😁💚`,
      myHtml,
      pdfBuffer
    );
    const items_ordered = product.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const allOrders = await OrderModel.find({
      user_id: new ObjectId(user_id),
    });
    console.log("Coupon Id->", coupon_id);

    let code = null;

    if (coupon_id && ObjectId.isValid(coupon_id)) {
      const coupon = await CouponModel.findOne({
        _id: new ObjectId(coupon_id),
      });
      if (coupon) {
        code = coupon.code;
      }
    }

    return res.status(200).json({
      status: true,
      message: "Order placed successfully!",
      data: OrderData,
      total_ordered_items: items_ordered,
      allOrders: allOrders,
      couponUsed: coupon_id ? true : false,
      code: code ? code : null,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.getOrderDetails = async (req, res, next) => {
  try {
    let { user_id, page, searchValue, filterOrder } = req.body;
    let query = "";
    let query2 = "";
    let limit = 4;
    let skip = (page - 1) * limit;
    console.clear();

    if (!user_id && !page && !searchValue) {
      throw new Error("Some error occured!");
    } else if (filterOrder === "All Orders" && searchValue === "All") {
      query = OrderModel.find({ user_id: new ObjectId(user_id) });
      query2 = OrderModel.find({ user_id: new ObjectId(user_id) });
    } else if (filterOrder === "All Orders" && searchValue !== "All") {
      query = OrderModel.find({
        order_id: { $regex: searchValue, $options: "im" },
      });
      query2 = OrderModel.find({
        order_id: { $regex: searchValue, $options: "im" },
      });
    } else if (filterOrder !== "All Orders" && searchValue === "All") {
      query = OrderModel.find({
        order_status: { $regex: filterOrder, $options: "im" },
      });
      query2 = OrderModel.find({
        order_status: { $regex: filterOrder, $options: "im" },
      });
    } else if (filterOrder !== "All Orders" && searchValue !== "All") {
      query = OrderModel.find({
        $and: [
          {
            order_status: { $regex: filterOrder, $options: "im" },
          },
          {
            order_id: { $regex: searchValue, $options: "im" },
          },
        ],
      });
      query2 = OrderModel.find({
        $and: [
          {
            order_status: { $regex: filterOrder, $options: "im" },
          },
          {
            order_id: { $regex: searchValue, $options: "im" },
          },
        ],
      });
    }
    const data = await query.sort({ order_date: -1 }).skip(skip).limit(limit);
    const allData = await query2;
    return res.status(200).json({
      status: true,
      allOrders: data,
      data_length: allData.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.getKey = async (req, res, next) => {
  try {
    return res.status(200).json({
      key: process.env.key_id,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.processPayment = async (req, res, next) => {
  try {
    console.log("WE->1");

    const razorpay = new Razorpay({
      key_id: process.env.key_id,
      key_secret: process.env.key_secret,
    });
    const {
      user_id,
      cart_data,
      totalPrice,
      payment_mode,
      order_status,
      coupon_id,
    } = req.body;
    console.log("WE->2");

    const formattedDate = moment().format("D MMMM, YYYY [at] h:mm A");
    const order_id = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")}`;

    const options = {
      amount: totalPrice * 100,
      currency: "INR",
      receipt: order_id,
    };
    const Order = await razorpay.orders.create(options);
    const userData = await UserModel.find({ _id: new ObjectId(user_id) });
    const OrderData = await OrderModel.create({
      user_id: new ObjectId(user_id),
      coupon_id: coupon_id || undefined,
      product: cart_data,
      totalPrice: totalPrice,
      payment_mode: payment_mode,
      payment_status: "due",
      order_date: formattedDate,
      order_status: order_status,
      order_id: order_id,
    });
    console.log("WE->3");

    const { product } = OrderData;
    const items_ordered = product.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const allOrders = await OrderModel.find({
      user_id: new ObjectId(user_id),
    });
    console.log("WE->4");
    let code = null;

    if (coupon_id && ObjectId.isValid(coupon_id)) {
      const coupon = await CouponModel.findOne({
        _id: new ObjectId(coupon_id),
      });
      if (coupon) {
        code = coupon.code;
      }
    }
    return res.status(200).json({
      status: true,
      order: Order,
      data: OrderData,
      total_ordered_items: items_ordered,
      allOrders: allOrders,
      couponUsed: coupon_id ? true : false,
      code: code ? code : null,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};

exports.orderConfirm = async (req, res, next) => {
  try {
    const {
      currentOrder,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const userData = await UserModel.find({
      _id: new ObjectId(currentOrder.user_id),
    });
    const orderEmailPath = path.join(
      __dirname,
      "../public",
      "orderConfirm.html"
    );
    const htmlTemplate = fs.readFileSync(orderEmailPath, "utf-8");
    const myHtml = htmlTemplate
      .replace("{{name}}", userData[0].fname)
      .replace("{{orderID}}", currentOrder.order_id)
      .replace("{{orderValue}}", currentOrder.totalPrice);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(body.toString())
      .digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const { product, _id, user_id } = currentOrder;
      const pdfBuffer = await sendPdf(currentOrder);
      await OrderModel.updateOne(
        { _id: new ObjectId(currentOrder._id) },
        {
          payment_status: "paid",
        }
      );
      for (const item of product) {
        await ProductModel.updateOne(
          { _id: new ObjectId(item.product_id) },
          {
            $inc: {
              product_quantity: parseInt(-item.quantity),
            },
          }
        );
        await OrderRelationModel.create({
          user_id: new ObjectId(user_id),
          product_id: new ObjectId(item.product_id),
          order_id: new ObjectId(_id),
          status: "processing",
        });
      }
      await sendMail(
        userData[0].email,
        `Order Confirmed!`,
        `Thank You! ${userData[0].fname}, for your purchase from us😁💚`,
        myHtml,
        pdfBuffer
      );
      return res.status(200).json({
        status: true,
        message: "Order placed successfully!",
        data: isAuthentic,
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};
exports.orderFailed = async (req, res, next) => {
  try {
    const { order_id, user_id } = req.body;
    await OrderModel.deleteOne({
      _id: new ObjectId(order_id),
    });
    const allOrders = await OrderModel.find({
      user_id: new ObjectId(user_id),
    });
    return res.status(200).json({
      status: true,
      allOrders: allOrders,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Some error occured!",
      error: err,
    });
  }
};

exports.pdfGenerate = async (req, res, next) => {
  try {
    const { currentOrder } = req.body;
    const BASE_URL = process.env.BASE_URL;

    const orderEmailPath = path.join(
      __dirname,
      "../public",
      "orderStatement.html"
    );
    const htmlTemplate = fs.readFileSync(orderEmailPath, "utf-8");

    // Generate product rows with proper image URLs
    const productRows = currentOrder.product
      .map((product) => {
        let imageUrl = `${BASE_URL}/images/` + product.product_image;
        return `
        <tr class="product-row">
          <td style="width: 80px;">
            <img src=${imageUrl} class="product-image" alt= "Product"
        }" 
          style="max-width: 80px; max-height: 80px; object-fit: contain;">
          </td>
          <td class="product-info">
            <div class="product-name">${product.product_name || "Product"}</div>
            <div class="product-price">₹${(
              product.total_price / product.quantity
            ).toFixed(2)}</div>
          </td>
          <td class="product-quantity" style="margin-left: 10px"> ${
            product.quantity
          }</td>
          <td class="product-price">₹${product.total_price.toFixed(2)}</td>
        </tr>
        `;
      })
      .join("");

    // Rest of your code remains the same...
    const userData = await UserModel.find({
      _id: new ObjectId(currentOrder.user_id),
    });

    // Calculate totals
    const subtotal = currentOrder.product.reduce(
      (sum, product) => sum + product.total_price,
      0
    );
    const shipping = 40; // Set your shipping cost
    const tax = subtotal * 0.1; // Set your tax calculation
    const total = currentOrder.totalPrice;

    const myHtml = htmlTemplate
      .replace(/\{\{name\}\}/g, `${userData[0].fname} ${userData[0].lname}`)
      .replace(/\{\{order_id\}\}/g, currentOrder.order_id)
      .replace(/\{\{order_date\}\}/g, currentOrder.order_date)
      .replace(/\{\{address\}\}/g, userData[0].address)
      .replace(/\{\{city\}\}/g, userData[0].city)
      .replace(/\{\{state\}\}/g, userData[0].state)
      .replace(/\{\{zip\}\}/g, userData[0].pincode)
      .replace(
        /\{\{payment_method\}\}/g,
        currentOrder.payment_mode.split("-").join(" ").toUpperCase()
      )
      .replace(/\${productRowsHTML}/g, productRows)
      .replace(/\₹\[Subtotal\]/g, subtotal.toFixed(2))
      .replace(/\₹\[Shipping\]/g, shipping.toFixed(2))
      .replace(/\₹\[Tax\]/g, tax.toFixed(2))
      .replace(/\₹\[Total\]/g, total.toFixed(2));

    const file = { content: myHtml };
    const pdfBuffer = await pdf.generatePdf(file, {
      format: "A4",
      printBackground: true,
      margin: { top: "1mm", bottom: "5mm" },
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="order_receipt.pdf"',
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).send("Failed to generate PDF");
  }
};
