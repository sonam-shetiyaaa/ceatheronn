const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ MySQL Connected Successfully");
});

// ---------- REGISTER API ----------
app.post("/api/register", (req, res) => {
  const { name, email, password, role, studentId } = req.body;

  const query = `
    INSERT INTO users (name, email, password, role, student_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, password, role, studentId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "User already exists or DB error" });
    }
    res.json({ message: "✅ User registered successfully" });
  });
});

// ---------- LOGIN API ----------
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;

  const query = `SELECT * FROM users WHERE email=? AND password=? AND role=?`;

  db.query(query, [email, password, role], (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "❌ Invalid Login Details" });
    }

    res.json({ message: "✅ Login success", user: result[0] });
  });
});

// ---------- ADD COMPLAINT ----------
app.post("/api/complaints", (req, res) => {
  const { title, issueType, location, description, studentId, studentName } = req.body;

  const query = `
    INSERT INTO complaints (title, issue_type, location, description, student_id, student_name, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Open')
  `;

  db.query(query, [title, issueType, location, description, studentId, studentName], (err) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json({ message: "✅ Complaint Submitted" });
  });
});

// ---------- GET ALL COMPLAINTS (ADMIN) ----------
app.get("/api/complaints", (req, res) => {
  const query = "SELECT * FROM complaints ORDER BY created_at DESC";

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });

    res.json(result);
  });
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Server running on http://localhost:" + process.env.PORT);
});
