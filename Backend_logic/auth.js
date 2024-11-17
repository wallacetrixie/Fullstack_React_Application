const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const SECRET_KEY = "yA%55G_9;;y7ttFFF%5VVeer547^^8gf5AAWJ88990OHHtvr5:</";

// Register Route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const checkUserQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserQuery, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserQuery =
      "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertUserQuery, [username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ success: true, message: "User registered successfully" });
    });
  });
});

// Login Route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const findUserQuery = "SELECT * FROM users WHERE username = ?";
  db.query(findUserQuery, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token, message: "Login successful" });
  });
});

// Protected Route (Redirect to tasks page)
router.get("src/tasks.jsx", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Welcome to tasks page" });
});

module.exports = router;
