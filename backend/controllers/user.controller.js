const db = require("../db");

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        user_id,
        username,
        email,
        role,
        profile_image_path
      FROM users
      ORDER BY username ASC
      `
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Missing query" });
    }
    const userId = req.user.id;
    const [rows] = await db.query(
      `
      SELECT
      u.user_id,
      u.username,
      u.profile_image_path
      FROM users u
      WHERE u.username LIKE ?
        AND u.user_id != ?
        AND NOT EXISTS (
      SELECT 1
      FROM friends f
      WHERE (f.user_a = u.user_id AND f.user_b = ?)
         OR (f.user_b = u.user_id AND f.user_a = ?)
      )
      LIMIT 10;
      `,
      [`%${query}%`, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id == userId) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted (banned)" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};