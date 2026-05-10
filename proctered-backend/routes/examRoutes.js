console.log("NEW ROUTE FILE LOADED");
console.log("examRoutes loaded");

const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();


// START EXAM (FIXED)
router.post("/startExam", authenticateToken, (req, res) => {
  const { exam_id } = req.body;
  const user_id = req.user.user_id;

  db.get(
    "SELECT * FROM Results WHERE user_id = ? AND exam_id = ?",
    [user_id, exam_id],
    (err, result) => {

      if (err) {
        console.error("START EXAM ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result) {
        return res.status(400).json({ message: "Exam already attempted" });
      }

      // FIXED QUERY (ONLY ONE db.all + exam_id filter)
      db.all(
        "SELECT * FROM Questions WHERE exam_id = ?",
        [exam_id],
        (err, questions) => {

          if (err) {
            console.error("FETCH QUESTIONS ERROR:", err);
            return res.status(500).json({ error: err.message });
          }

          console.log("Questions fetched:", questions.length);

          // Shuffle questions
          questions.sort(() => Math.random() - 0.5);

          res.json({ questions });
        }
      );
    }
  );
});


// TEST ROUTE
router.get("/test", (req, res) => {
  res.send("test route working");
});


// DEBUG ROUTE
router.get("/debug", (req, res) => {
  db.all("SELECT * FROM Questions", [], (err, rows) => {
    console.log("DEBUG HIT");
    console.log("ERROR:", err);
    console.log("ROWS:", rows);

    res.json({
      error: err,
      data: rows
    });
  });
});


// QUESTIONS ROUTE (ALL QUESTIONS)
router.get("/questions", (req, res) => {
  console.log("QUESTIONS API HIT");

  db.all("SELECT * FROM Questions", [], (err, rows) => {
    if (err) {
      console.error("REAL ERROR:", err.message);
      return res.json({ error: err.message });
    }

    console.log("DATA:", rows);
    res.json(rows);
  });
});

module.exports = router;