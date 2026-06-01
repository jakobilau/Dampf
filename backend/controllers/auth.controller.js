const db = require("../db");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { username, password } = req.body;

  const [existing] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (existing.length > 0) {
    return res.status(409).json({ message: "User exists" });
  }

  await db.query(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, password]
  );

  res.json({ message: "User created" });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ? AND password_hash = ?",
    [username, password]
  );

  // console.log(rows,password,username);

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