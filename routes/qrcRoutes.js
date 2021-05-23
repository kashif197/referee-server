const express = require("express");
const router = express.Router();

var QRCode = require("qrcode");
const Business = require("../models/Business");

// Generate QR-Code
router.post("/generate-qrcode", (req, res) => {
  QRCode.toDataURL("I am a pony!")
    .then((url) => {
      console.log(url);
    })
    .catch((err) => {
      console.error(err);
    });
});


module.exports = router;
