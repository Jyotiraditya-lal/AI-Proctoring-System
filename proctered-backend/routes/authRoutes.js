const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const { SECRET } =
require("../middleware/authMiddleware");

const db = require("../db");


// REGISTER API
router.post("/register", (req, res) => {

  const {
    name,
    email,
    password,
  } = req.body;

  db.run(

    `INSERT INTO Users 
(name, email, password)
VALUES (?, ?, ?)`,

    [name, email, password],
function(err) {

  if (err) {

    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }

      res.json({
        message: "Registration successful"
      });

    }

  );

});


// LOGIN API
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  db.get(

    "SELECT * FROM Users WHERE email = ? AND password = ?",

    [email, password],

    (err, user) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        });

      }

      if (user) {

        const token = jwt.sign(
          {
            user_id: user.user_id,
            role: user.role
          },

          SECRET,

          {
            expiresIn: "2h"
          }
        );

        res.json({
          success: true,
          token,
          user
        });

      }

      else {

        res.json({
          success: false,
          message: "Invalid credentials"
        });

      }

    }

  );

});

module.exports = router;