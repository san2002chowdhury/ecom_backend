const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
exports.getBase64Logo = () => {
  const logoPath = path.join(__dirname, "../public/Logo.png");
  const imageData = fs.readFileSync(logoPath);
  const mimeType = "image/png";
  return `data:${mimeType};base64,${imageData.toString("base64")}`;
};
