const db = require("../db");

exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
  SELECT 
      u.user_id,
      u.username,
      u.profile_image_path
  FROM friends f
  JOIN users u 
    ON u.user_id = f.user_b
  WHERE f.user_a = ?

  UNION

  SELECT 
      u.user_id,
      u.username,
      u.profile_image_path
  FROM friends f
  JOIN users u 
    ON u.user_id = f.user_a
  WHERE f.user_b = ?
  `,
      [userId, userId],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
