const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
// ------------- Import Router from Routes folder -----------
const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoriesRoutes");
const productRouter = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const contactRouter = require("./routes/contactRoutes");
const orderRouter = require("./routes/orderRoutes");
const couponRouter = require("./routes/couponRoutes");

// ------------- Using Some Middlewares-----------------
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(bodyParser.text({ type: ["text/xml", "application/xml"] }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(cookieParser());
app.set("trust proxy", true);
// ------------- Define Routes Path-----------------
app.use("/api/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/review", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/contact", contactRouter);
app.use("/api/order", orderRouter);
app.use("/api/coupon", couponRouter);

// ------------- Export App Component-----------------
module.exports = app;
