const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
const fetch = require("node-fetch");

// ✅ Send WhatsApp alert (using WhatsApp API link)
router.post("/send-whatsapp", auth, async (req, res) => {
  try {
    const { location, name } = req.body;
    if (!location) return res.status(400).json({ error: "No location provided" });

    // get emergency contact from database
    db.get(
      "SELECT emergencyNumber FROM users WHERE id = ?",
      [req.user.id],
      async (err, row) => {
        if (err) {
          console.error("DB error:", err.message);
          return res.status(500).json({ error: "DB lookup failed" });
        }
        if (!row || !row.emergencyNumber)
          return res.status(404).json({ error: "No emergency number found" });

        const message = `🚨 ${name || "This person"} is in danger! Their current location: https://maps.google.com/?q=${location}`;
        const encodedMsg = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${row.emergencyNumber}?text=${encodedMsg}`;

        console.log("✅ WhatsApp alert ready:", whatsappUrl);

        // optional: trigger it (this just logs for now)
        return res.json({ success: true, whatsappUrl });
      }
    );
  } catch (err) {
    console.error("send-whatsapp error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
