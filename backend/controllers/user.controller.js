const db = require("../db");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Missing query" });
    }
    const userId = req.user.id;
    const [rows] = await db.query(
      `
      SELECT u.username
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