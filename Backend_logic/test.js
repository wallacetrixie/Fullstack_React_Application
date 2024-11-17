const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "test", 
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// API to insert name
app.post("/add-name", (req, res) => {
  const { name } = req.body;
  const query = "INSERT INTO names (name) VALUES (?)";
  db.query(query, [name], (err) => {
    if (err) {
      console.error("Error inserting name:", err);
      return res.status(500).send("Error saving name");
    }
    res.status(200).send("Name added successfully");
  });
});

// API to fetch the latest name
app.get("/get-name", (req, res) => {
  const query = "SELECT name FROM names ORDER BY id DESC LIMIT 1";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching name:", err);
      return res.status(500).send("Error retrieving name");
    }
    res.status(200).json(result[0] || { name: "No name found" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
