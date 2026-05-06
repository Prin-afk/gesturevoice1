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

  // --- LEADERBOARD TABLE (NEW) ---
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

// LETTER LEARNING TABLE
db.run(`
CREATE TABLE IF NOT EXISTS letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  letter TEXT,
  word TEXT,
  video TEXT
)
`);

// TEST RESULTS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  score INTEGER,
  created_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
`);






  // --- ADD NEW COLUMNS TO USERS SAFELY ---
  db.all(`PRAGMA table_info(users);`, [], (err, rows) => {
    if (err) {
      console.error("Error checking users table:", err.message);
      return;
    }

    const existingCols = rows.map((r) => r.name);

    const addColumn = (colName) => {
      return new Promise((resolve) => {
        if (!existingCols.includes(colName)) {
          db.run(`ALTER TABLE users ADD COLUMN ${colName} TEXT;`, (err) => {
            if (err) {
              console.warn(`⚠️ ${colName} add failed:`, err.message);
            } else {
              console.log(`✅ Added ${colName} column`);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    };

    // Add all new columns sequentially to avoid lock
    (async () => {
      await addColumn("emergency_email");
      await addColumn("emergencyNumber");
      await addColumn("emergency_matrix_id");
      await addColumn("emergency_matrix_room_id");
    })();
  });
});

module.exports = db;