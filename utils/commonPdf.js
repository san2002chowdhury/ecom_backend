const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf-node");
const { getBase64Logo } = require("../utils/base64Logo");
const dotenv = require("dotenv");
const UserModel = require("../model/user");
dotenv.config({ path: "./config.env" });
let ObjectId = require("mongodb").ObjectId;
exports.sendPdf = async (currentOrder) => {
  try {
    const BASE_URL = process.env.BASE_URL;
    const userData = await UserModel.find({
      _id: new ObjectId(currentOrder.user_id),
    });
    const orderStatementEmailPath = path.join(
      __dirname,
      "../public",
      "orderStatement.html"
    );
    const htmlTemplate1 = fs.readFileSync(orderStatementEmailPath, "utf-8");
    const productRows = currentOrder.product
      .map((product) => {
        let imageUrl = `${BASE_URL}/api/images/${product.product_image}`;
        return `
       <tr class="product-row">
        <td>
          <img src="${imageUrl}" class="product-image" alt="Product Image" />
        </td>
        <td class="product-info">
          <div class="product-name">${product.product_name}</div>
          <div class="product-price">₹${(
            product.total_price / product.quantity
          ).toFixed(2)}</div>
        </td>
        <td class="product-quantity">${product.quantity}</td>
        <td class="product-price">₹${product.total_price.toFixed(2)}</td>
      </tr>`;
      })
      .join("");

    const subtotal = currentOrder.product.reduce(
      (sum, product) => sum + product.total_price,
      0
    );
    const shipping = 40;
    const tax = "5%";
    const total = currentOrder.totalPrice;

    const myHtml1 = htmlTemplate1
      .replace("LOGO", getBase64Logo())
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
      .replace(/\₹\[Subtotal\]/g, `₹${subtotal.toFixed(2)}`)
      .replace(/\₹\[Shipping\]/g, `₹${shipping.toFixed(2)}`)
      .replace(/\₹\[Tax\]/g, tax)
      .replace(
        /\₹\[Total\]/g,
        subtotal + 40 + subtotal * 0.05 > total
          ? `(Coupon Applied) ₹${total.toFixed(2)}`
          : `₹${total.toFixed(2)}`
      );

    const file = { content: myHtml1 };
    const pdfBuffer = await pdf.generatePdf(file, {
      format: "A4",
      printBackground: true,
      margin: { top: "2mm", bottom: "1mm" },
    });
    return pdfBuffer;
  } catch (err) {
    return err;
  }
};
