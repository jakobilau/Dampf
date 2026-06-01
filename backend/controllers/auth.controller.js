const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

// REGISTER
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "User exists" });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
      [username, hash, email, "user"]
    );

    return res.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};




exports.login = async (req, res) => {
  const { username, password } = req.body;

  const hashed_password = await bcrypt.hash(password, saltRounds);

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ? AND password_hash = ?",
    [username, hashed_password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const token = jwt.sign(
    { id: rows[0].id, username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};