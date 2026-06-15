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

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Missing credentials",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 💥 FIXED COOKIE (WICHTIG)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // später true bei HTTPS
      sameSite: "lax",
      path: "/", // 🔥 WICHTIGER FIX
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ME
exports.me = async (req, res) => {
  try {
    console.log("User ID from token:", req.user.id);
    console.log("vor qwewy");
    const [rows] = await db.query(
       "SELECT user_id, username, email, role FROM users WHERE user_id = ? ",
      [req.user.id]
    );
    console.log("nach qwewy");
    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};