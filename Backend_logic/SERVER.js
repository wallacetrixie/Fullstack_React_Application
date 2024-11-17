const express = require("express");
const session = require("express-session");
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const SECRET_KEY = "yA%55G_9;;y7ttFFF%5VVeer547^^8gf5AAWJ88990OHHtvr5:</";

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Set up sessions
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

// Register Route
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const checkUserQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserQuery, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.length > 0) {
      return res
        .status(400)
        .json({ message: "Username already exists, try again" });
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

// Login Route with session initialization
app.post("/login", (req, res) => {
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

    // Initializing session and save user info in the session
    req.session.userId = user.id;
    req.session.username = user.username;

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      success: true,
      token,
      message: "Login successful",
      redirectUrl: "/tasks",
    });
  });
});

// Protected route with session check
app.get("/tasks", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized access" });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized access" });

    // Check session to confirm user access
    if (req.session.userId !== decoded.id) {
      return res.status(403).json({ message: "Invalid session" });
    }

    res.json({
      success: true,
      message: `Welcome to tasks page, ${req.session.username}`,
    });
  });
});

//endpoint to retrieve username
app.get("/user", (req, res) => {
  if (req.session.userId) {
    return res.json({
      success: true,
      username: req.session.username,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
