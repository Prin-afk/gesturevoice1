const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * ✅ USER SIGNUP — includes emergency info
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, emergency_email, emergencyNumber } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password, emergency_email, emergencyNumber)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, emergency_email || null, emergencyNumber || null],
      function (err) {
        if (err) {
          console.error("Signup DB error:", err.message);
          if (err.message.includes("UNIQUE"))
            return res.status(400).json({ error: "Email already registered" });
          return res.status(500).json({ error: "Database error" });
        }

        const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ message: "Signup successful", token });
      }
    );
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ USER LOGIN — unchanged
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token });
  });
});

/**
 * ✅ PROTECTED USER INFO ROUTE
 */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    db.get(
      `SELECT id, name, email, emergency_email, emergencyNumber FROM users WHERE id = ?`,
      [decoded.id],
      (err, row) => {
        if (err || !row) return res.status(404).json({ error: "User not found" });
        res.json({ user: row });
      }
    );
  });
});

module.exports = router;
