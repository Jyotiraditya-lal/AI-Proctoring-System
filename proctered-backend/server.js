console.log("MY NEW SERVER FILE RUNNING");

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/result", resultRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// VIOLATION API
app.post("/api/exam/violation", (req, res) => {

  const { user_id, exam_id, violation_type } = req.body;

  db.run(
    `INSERT INTO Violations 
    (user_id, exam_id, violation_type, timestamp)
    VALUES (?, ?, ?, datetime('now'))`,

    [user_id, exam_id, violation_type],

    (err) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Database error"
        });
      }

      res.json({
        message: "Violation saved successfully"
      });

    }
  );

});


// ADMIN RESULTS API
app.get("/api/admin/results", (req, res) => {

  const query = `
    SELECT 
      Users.name,
      Results.exam_id,
      Results.score
    FROM Results
    JOIN Users
    ON Results.user_id = Users.user_id
  `;

  db.all(query, [], (err, rows) => {

    if (err) {

      return res.status(500).json({
        error: err.message
      });

    }

    res.json(rows);

  });

});


// ADMIN VIOLATIONS API
app.get("/api/admin/violations", (req, res) => {

  const query = `
    SELECT 
      Users.name,
      Violations.violation_type,
      Violations.timestamp
    FROM Violations
    JOIN Users
    ON Violations.user_id = Users.user_id
  `;

  db.all(query, [], (err, rows) => {

    if (err) {

      return res.status(500).json({
        error: err.message
      });

    }

    res.json(rows);

  });

});


// ADMIN DASHBOARD STATS API
app.get("/api/admin/stats", (req, res) => {

  const stats = {};

  db.get(
    "SELECT COUNT(*) AS totalStudents FROM Users WHERE role = 'student'",
    [],

    (err, studentResult) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        });

      }

      stats.totalStudents = studentResult.totalStudents;

      db.get(
        "SELECT COUNT(*) AS totalViolations FROM Violations",
        [],

        (err, violationResult) => {

          if (err) {

            return res.status(500).json({
              error: err.message
            });

          }

          stats.totalViolations = violationResult.totalViolations;

          db.get(
            "SELECT COUNT(*) AS totalResults FROM Results",
            [],

            (err, resultData) => {

              if (err) {

                return res.status(500).json({
                  error: err.message
                });

              }

              stats.totalResults = resultData.totalResults;

              res.json(stats);

            }
          );

        }
      );

    }
  );

});

app.get("/users-table", (req, res) => {

  db.all(
    "PRAGMA table_info(Users)",
    [],
    (err, rows) => {

      if (err) {
        return res.json(err);
      }

      res.json(rows);

    }
  );

});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});