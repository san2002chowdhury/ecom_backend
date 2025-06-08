const express = require("express");
const router = express.Router();
const ContactController = require("./../controller/contactController");
router.route("/getContact").post(ContactController.getContact);
router.route("/subscribe").post(ContactController.subscribeNewsLetter);
module.exports = router;
