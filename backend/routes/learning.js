const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
const multer = require("multer");
const path = require("path");



// ✅ Save test results
router.post("/save-result", auth, (req, res) => {
  const { score } = req.body;
  if (score == null) return res.status(400).json({ error: "Missing score" });

  db.run(
    "INSERT INTO test_results (user_id, score, created_at) VALUES (?, ?, datetime('now'))",
    [req.user.id, score],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// ✅ Get user test history
router.get("/results", auth, (req, res) => {
  db.all(
    "SELECT * FROM test_results WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
