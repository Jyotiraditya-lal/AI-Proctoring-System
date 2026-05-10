const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit Exam
router.post("/submit", authenticateToken, (req, res) => {

  const { exam_id, answers } = req.body;

  const user_id = req.user.user_id;

  db.all(
    "SELECT question_id, correct_answer FROM Questions WHERE exam_id = ?",
    [exam_id],
    (err, questions) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let score = 0;

      questions.forEach((q) => {

        const userAnswer = answers.find(
          (a) => a.question_id === q.question_id
        );

        if (
          userAnswer &&
          userAnswer.selected_option === q.correct_answer
        ) {
          score++;
        }

      });

      db.run(
        "INSERT INTO Results (user_id, exam_id, score) VALUES (?, ?, ?)",
        [user_id, exam_id, score],

        function (err) {

          if (err) {
            return res.status(500).json({ error: err.message });
          }

          console.log("Final Score:", score);

          // VERY IMPORTANT
          res.json({
            success: true,
            score: score
          });

        }
      );

    }
  );

});

module.exports = router;