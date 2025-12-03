const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const Twilio = require('twilio');

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SMS_FROM = process.env.TWILIO_SMS_FROM; // Must be an SMS-enabled Twilio number

let twilioClient = null;
if (TWILIO_SID && TWILIO_TOKEN) {
  twilioClient = Twilio(TWILIO_SID, TWILIO_TOKEN);
  console.log("✅ Twilio initialized for SMS");
} else {
  console.warn("⚠️ Twilio not configured — alerts will be simulated");
}

// Promisify db queries
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
});
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

// ---------------------------
// Main alert route
// ---------------------------
router.post('/send', auth, async (req, res) => {
  try {
    console.log("🚨 Incoming alert trigger");
    console.log("Request body:", req.body);

    const userId = req.userId;
    const { lat = null, lng = null, recognizedText } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    if (!recognizedText) return res.status(400).json({ error: 'recognizedText required' });

    // Fetch user
    const userRow = await dbGet('SELECT id, name, emergencyNumber FROM users WHERE id = ?', [userId]);
    if (!userRow) return res.status(404).json({ error: 'User not found' });

    if (!userRow.emergencyNumber) return res.status(400).json({ error: 'No emergency number configured' });

    const locationPart = (lat && lng) ? `\n📍 Location: https://maps.google.com/?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` : '';

    const messageText = `🚨 ALERT: ${userRow.name || 'Someone'} may be in danger!\nDetected: "${recognizedText}"${locationPart}`;

    console.log("🧠 User row:", userRow);
    console.log("📝 Message text:", messageText);

    const results = [];

    const phone = userRow.emergencyNumber.trim();
    console.log("📞 Sending SMS to:", phone);

    if (twilioClient && TWILIO_SMS_FROM) {
      try {
        const msg = await twilioClient.messages.create({
          from: TWILIO_SMS_FROM,
          to: phone,
          body: messageText,
        });
        console.log("✅ SMS sent, SID:", msg.sid, "Status:", msg.status);
        results.push({ to: phone, sid: msg.sid, status: msg.status });
      } catch (e) {
        console.error("❌ SMS send error:", e.message);
        results.push({ to: phone, error: e.message });
      }
    } else {
      console.log('Simulated SMS to', phone, '\n', messageText);
      results.push({ to: phone, simulated: true });
    }

    return res.json({ results });

  } catch (err) {
    console.error('❌ Unexpected error in /send:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
