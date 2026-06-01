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

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const user = rows[0];

  const validPassword = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!validPassword) {
    return res.status(401).json({
      message: "Invalid Login"
    });
  }

  const token = jwt.sign(
    { id: user.user_id, username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};