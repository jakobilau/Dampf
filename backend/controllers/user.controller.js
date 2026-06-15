const db = require("../db");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Missing query" });
    }

    const [rows] = await db.query(
      `
      SELECT username
      FROM users
      WHERE username LIKE ?
      LIMIT 10
      `,
      [`%${query}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};