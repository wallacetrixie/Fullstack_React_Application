const express = require("express");
const db = require("../config/db"); 
const router = express.Router();

router.post("/", (req, res) => {
  const { eventName, venue, date } = req.body;
  // Validate request body
  if (!eventName || !venue || !date) {
    return res
      .status(400)
      .json({ message: "Please fill in all fields before submitting." });
  }
  const data = { event_name: eventName, venue, event_date: date };
  db.query("INSERT INTO events SET ?", data, (err, result) => {
    if (err) {
      console.error("Error inserting event:", err);
      return res
        .status(500)
        .json({ message: "Failed to schedule the event. Please try again." });
    }

    if (result.affectedRows === 1) {
      res.status(201).json({ message: "Event scheduled successfully!" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to schedule the event. Please try again." });
    }
  });
});

module.exports = router;
