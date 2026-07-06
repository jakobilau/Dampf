const db = require("../db");

exports.getPublisherDashboard = async (req, res) => {
  try {
    const publisherId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
          g.game_id,
          g.title,
          g.genre,
          g.folder_name,
          COUNT(le.user_id) AS library_count,

          COALESCE(SUM(
              CASE
                  WHEN le.is_favored = 1 THEN 1
                  ELSE 0
              END
          ), 0) AS favorites_count,

          COALESCE(SUM(le.playtime_minutes), 0) AS total_playtime

      FROM games g

      LEFT JOIN library_entries le
      ON g.game_id = le.game_id

      WHERE g.publisher_id = ?

      GROUP BY
          g.game_id,
          g.title,
          g.genre

      ORDER BY g.title
      `,
      [publisherId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};