const express = require("express");
const router = express.Router();
const db = require("../db");


// ===============================
// SAVE SCORE
// POST /leaderboard/add
// ===============================
router.post("/add", (req, res) => {

  const { name, score } = req.body;

  // validation
  if (!name || score === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing name or score"
    });
  }

  const query = `
    INSERT INTO leaderboard (name, score)
    VALUES (?, ?)
  `;

  db.run(query, [name, score], function (err) {

    if (err) {
      console.error("Leaderboard insert error:", err);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      message: "Score saved successfully",
      id: this.lastID
    });

  });

});


// ===============================
// GET LEADERBOARD
// GET /leaderboard
// ===============================
router.get("/", (req, res) => {

  const query = `
    SELECT id, name, score, created_at
    FROM leaderboard
    ORDER BY score DESC
    LIMIT 10
  `;

  db.all(query, [], (err, rows) => {

    if (err) {
      console.error("Leaderboard fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      leaderboard: rows
    });

  });

});

module.exports = router;