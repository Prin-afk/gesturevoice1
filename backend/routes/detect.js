const express = require("express");
const router = express.Router();
const multer = require("multer");
const { spawn } = require("child_process");

const upload = multer({ dest: "uploads/" });

router.post("/image", upload.single("image"), (req, res) => {
  const python = spawn("python", [
    "backend/python/inference.py",
    req.file.path
  ]);

  python.stdout.on("data", (data) => {
    res.json({ letter: data.toString().trim() });
  });
});

module.exports = router;
