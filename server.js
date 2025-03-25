const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lost_found",
});

db.connect((err) => {
    if (err) console.error("❌ Database Connection Failed!", err);
    else console.log("✅ Connected to MySQL");
});

// ✅ User Registration
app.post("/register", (req, res) => {
    const { email, password, contact, address } = req.body;

    if (!email || !password || !contact || !address) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = "INSERT INTO users (email, password_hash, contact, address) VALUES (?, ?, ?, ?)";

    db.query(query, [email, hashedPassword, contact, address], (err) => {
        if (err) return res.status(500).json({ message: "Error registering user", error: err });
        res.json({ message: "Registration successful" });
    });
});

// ✅ User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(400).json({ message: "User not found" });

        const user = results[0];
        if (bcrypt.compareSync(password, user.password_hash)) {
            res.json({ message: "Login successful", user_id: user.user_id });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    });
});

// ✅ Report Lost Item
app.post("/report-lost", (req, res) => {
    const { user_id, item_name, category, description, lost_date, lost_location } = req.body;

    if (!user_id || !item_name || !category || !description || !lost_date || !lost_location) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const query = "INSERT INTO lost_items (user_id, item_name, category, description, lost_date, lost_location) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(query, [user_id, item_name, category, description, lost_date, lost_location], (err) => {
        if (err) return res.status(500).json({ message: "Failed to report lost item", error: err });
        res.json({ message: "Lost item reported successfully!" });
    });
});

// ✅ Report Found Item
app.post("/report-found", (req, res) => {
    const { user_id, item_name, category, description, found_date, found_location } = req.body;

    // Check for missing fields
    if (!user_id || !item_name || !category || !description || !found_date || !found_location) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const query = "INSERT INTO found_items (user_id, item_name, category, description, found_date, found_location) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(query, [user_id, item_name, category, description, found_date, found_location], (err) => {
        if (err) return res.status(500).json({ message: "Failed to report found item", error: err });
        res.json({ message: "Found item reported successfully!" });
    });
});

// ✅ Get Lost Items
app.get("/lost-items", (req, res) => {
    const query = "SELECT * FROM lost_items ORDER BY lost_date DESC";

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching lost items", error: err });

        res.json(results);
    });
});

// ✅ Get Found Items
app.get("/found-items", (req, res) => {
    const query = "SELECT * FROM found_items ORDER BY found_date DESC";

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching found items", error: err });

        res.json(results);
    });
});


// ✅ Start Server
app.listen(5000, () => {
    console.log("✅ Server is running on port 5000");
});
