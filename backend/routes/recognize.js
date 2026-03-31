const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      { imagePath },
      { headers: { "Content-Type": "application/json" } }
    );

    fs.unlink(imagePath, () => {}); // delete temp image

    res.json({
      recognizedText: response.data.recognizedText,
      confidence: response.data.confidence,
    });
  } catch (err) {
    console.error("Recognition error:", err.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

module.exports = router;
