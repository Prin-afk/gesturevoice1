const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');


// ✅ Get profile + contacts + triggers + emergency info
router.get('/profile', auth, (req, res) => {
  const userId = req.userId;

  db.get(
    `SELECT id, name, email, emergency_email, emergencyNumber FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        console.error('DB error fetching user:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) return res.status(404).json({ error: 'User not found' });

      db.all(
        `SELECT name,emergencyNumber  FROM users WHERE id = ?`,
        [userId],
        (err, contacts) => {
          if (err) return res.status(500).json({ error: 'DB error (contacts)' });

          db.all(
            `SELECT word FROM triggers WHERE user_id = ?`,
            [userId],
            (err, triggersRows) => {
              if (err) return res.status(500).json({ error: 'DB error (triggers)' });

              const triggers = triggersRows.map((r) => r.word);

              // ✅ Return all combined user info
              res.json({
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  emergencyEmail: user.emergency_email || null,
                  emergencyNumber: user.emergencyNumber || null,
                },
                contacts,
                triggers,
              });
            }
          );
        }
      );
    }
  );
});


// ✅ Add or update an emergency contact
router.post('/contacts', auth, (req, res) => {
  const userId = req.userId;
  const { name, phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  db.run(
    `INSERT INTO emergency_contacts (user_id, name, phone) VALUES (?,?,?)`,
    [userId, name || '', phone],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID, name, phone });
    }
  );
});


// ✅ Add a trigger word
router.post('/triggers', auth, (req, res) => {
  const userId = req.userId;
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'word required' });

  db.run(
    `INSERT INTO triggers (user_id, word) VALUES (?,?)`,
    [userId, word.toLowerCase()],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID, word });
    }
  );
});


// ✅ Remove a trigger word
router.delete('/triggers', auth, (req, res) => {
  const userId = req.userId;
  const { word } = req.body;

  db.run(
    `DELETE FROM triggers WHERE user_id = ? AND word = ?`,
    [userId, word.toLowerCase()],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ deleted: this.changes });
    }
  );
});


// ✅ Update Emergency Number Only
router.put("/update-emergency", auth, (req, res) => {
  const userId = req.userId;
  const { emergencyNumber } = req.body;

  if (!emergencyNumber) {
    return res.status(400).json({ error: "Emergency number required" });
  }

  db.run(
    `UPDATE users SET emergencyNumber = ? WHERE id = ?`,
    [emergencyNumber, userId],
    function (err) {
      if (err) {
        console.error("❌ DB update error:", err.message);
        return res.status(500).json({ error: "Database update failed" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`✅ User ${userId} emergency number updated`);
      res.json({ message: "Emergency number updated successfully" });
    }
  );
});


module.exports = router;
