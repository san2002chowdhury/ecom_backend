const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./config.env" });
// --------------For Database Connection---------------------
const DB_URL = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose
  .connect(DB_URL, {})
  .then(() => {
    console.log("=========>DB Connection Successful!<=========");
  })
  .catch((err) => console.log("====>ERROR In DB Connection<===="));
// -------------------For Server Starting---------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {});
