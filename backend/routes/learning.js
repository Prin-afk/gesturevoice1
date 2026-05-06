const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
const multer = require("multer");
const path = require("path");

/* =================================
   VIDEO STORAGE (FOR LETTER VIDEOS)
================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/* =================================
   LETTER LEARNING CONTENT
================================= */

// Upload video + word for a letter
router.post("/add-letter", upload.single("video"), (req, res) => {
  const { letter, word } = req.body;
  const videoPath = req.file ? req.file.path : null;

  if (!letter || !word || !videoPath) {
    return res.status(400).json({ error: "Missing letter, word or video" });
  }

  db.run(
    "INSERT INTO letters (letter, word, video) VALUES (?, ?, ?)",
    [letter, word, videoPath],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        success: true,
        message: "Letter learning content added"
      });
    }
  );
});

// Get all letters with words and videos
router.get("/letters", (req, res) => {
  db.all("SELECT * FROM letters", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

/* =================================
   TEST RESULT (USER HISTORY)
================================= */

// Save test result for logged-in user
router.post("/save-result", auth, (req, res) => {
  const { score } = req.body;

  if (score == null) {
    return res.status(400).json({ error: "Missing score" });
  }

  db.run(
    "INSERT INTO test_results (user_id, score, created_at) VALUES (?, ?, datetime('now'))",
    [req.user.id, score],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ success: true });
    }
  );
});

// Get user test history
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

/* =================================
   LEADERBOARD SYSTEM
================================= */

// Submit score for leaderboard
router.post("/submit-score", (req, res) => {
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: "Missing name or score" });
  }

  db.run(
    "INSERT INTO leaderboard (name, score) VALUES (?, ?)",
    [name, score],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        success: true,
        message: "Score submitted to leaderboard"
      });
    }
  );
});

// Get Top 10 leaderboard
router.get("/leaderboard", (req, res) => {
  db.all(
    `SELECT name, score
     FROM leaderboard
     ORDER BY score DESC
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    }
  );
});

module.exports = router;