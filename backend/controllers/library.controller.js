const db = require("../db");

exports.getLibrary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                g.game_id,
                g.title,
                g.genre,
                g.folder_name,
                g.cover_url,

                l.is_favored,
                l.playtime_minutes,
                l.last_played
            FROM library l
            JOIN games g ON g.game_id = l.game_id
            WHERE l.user_id = ?
        `, [req.user.id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.addToLibrary = async (req, res) => {
    try {
        await db.query(`
            INSERT INTO library
            (user_id, game_id, is_favored, playtime_minutes, last_played)
            VALUES (?, ?, 0, 0, NULL)
        `, [
            req.user.id,
            req.params.gameId
        ]);

        res.status(201).json({ message: "Added to library" });

    } catch (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Already in library" });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.removeFromLibrary = async (req, res) => {
    try {
        await db.query(`
            DELETE FROM library
            WHERE user_id = ?
            AND game_id = ?
        `, [
            req.user.id,
            req.params.gameId
        ]);

        res.json({ message: "Removed from library" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        await db.query(`
            UPDATE library
            SET is_favored = NOT is_favored
            WHERE user_id = ?
            AND game_id = ?
        `, [
            req.user.id,
            req.params.gameId
        ]);

        res.json({ message: "Favorite toggled" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.addPlaytime = async (req, res) => {
    try {
        const { minutes } = req.body;

        await db.query(`
            UPDATE library
            SET playtime_minutes = playtime_minutes + ?
            WHERE user_id = ?
            AND game_id = ?
        `, [
            minutes,
            req.user.id,
            req.params.gameId
        ]);

        res.json({ message: "Playtime updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};