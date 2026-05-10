const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "proctorx.db");

console.log("USING DB:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB CONNECTION ERROR:", err.message);
  } else {
    console.log("Connected to SQLite DB");
  }
});

// CHECK TABLES
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  console.log("TABLES:", tables);
});

module.exports = db;