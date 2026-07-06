const db = require("../db");

// GET all games
exports.getGames = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT game_id, publisher_id, folder_name, title, genre, cover_url
            FROM games
            ORDER BY title ASC
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getGame = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM games
            WHERE game_id = ?
        `, [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};