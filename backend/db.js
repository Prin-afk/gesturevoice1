const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");

// Create tables if not exist
db.serialize(() => {
  // --- USERS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // --- EMERGENCY CONTACTS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      phone TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // --- TRIGGERS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS triggers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      word TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // --- ADD NEW COLUMNS TO USERS (if not already there) ---
  db.all(`PRAGMA table_info(users);`, [], (err, rows) => {
    if (err) {
      console.error("Error checking users table:", err.message);
      return;
    }

    const existingCols = rows.map((r) => r.name);

    if (!existingCols.includes("emergency_email")) {
      db.run(`ALTER TABLE users ADD COLUMN emergency_email TEXT;`, (err) => {
        if (err)
          console.warn("⚠️ emergency_email column already exists or failed:", err.message);
        else console.log("✅ Added emergency_email column to users");
      });
    }

    if (!existingCols.includes("emergencyNumber")) {
      db.run(`ALTER TABLE users ADD COLUMN emergencyNumber TEXT;`, (err) => {
        if (err)
          console.warn("⚠️ emergencyNumber column already exists or failed:", err.message);
        else console.log("✅ Added emergencyNumber column to users");
      });
    }
  });
});

module.exports = db;
