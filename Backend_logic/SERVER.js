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
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    },
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

app.get("/user", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success:
        false,
      message: "Unauthorized"
    });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const findUserQuery = "SELECT username FROM users WHERE id = ?";
    db.query(findUserQuery, [decoded.id], (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      if (result.length === 0) {
        return res
          .status(404)
          .json({
            success: false,
            message: "User not found"
          });
      }
      res.json({
        success: true,
        username: result[0].username
      });
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});


 

// Endpoint to add an event
app.post("/events", (req, res) => {
  const { eventName, venue, date } = req.body;
  if (!eventName || !venue || !date) {
    return res.status(400).json({ message: "Please fill in all fields before submitting." });
  }

  const data = {
    event_name: eventName,
    venue,
    event_date: date,
  };
  db.query("INSERT INTO events SET ?", data, (err, result) => {
    if (err) {
      console.error("Error inserting event:", err);
      return res.status(500).json({ message: "Failed to schedule event. Please try again." });
    }
    if (result.affectedRows === 1) {
      return res.status(201).json({ message: "Event scheduled successfully!" });
    } else {
      return res.status(500).json({ message: "Failed to schedule the event. Please try again." });
    }
  });
});
app.get("/fetchEvents", (req, res) => {
  const fetchEventsQuery = `
    SELECT id, event_name AS eventName, venue, event_date AS eventDate
    FROM events
    ORDER BY event_date ASC
  `;

  db.query(fetchEventsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ message: "Failed to fetch events. Please try again." });
    }
    res.status(200).json({ success: true, events: results });
  });
});
// Endpoint to delete an event
app.delete("/deleteEvent/:id", (req, res) => {
  const { id } = req.params;
  const deleteEventQuery = "DELETE FROM events WHERE id = ?";
  db.query(deleteEventQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ message: "Failed to delete event. Please try again." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully." });
  });
});



app.listen(5000, () => {
  console.log("Server started on port 5000");
});
