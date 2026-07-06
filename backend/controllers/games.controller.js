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

// CREATE (admin)
exports.createGame = async (req, res) => {
    try {
        const {
            publisher_id,
            folder_name,
            title,
            genre,
            cover_url,
            description
        } = req.body;

        const [result] = await db.query(`
            INSERT INTO games
            (publisher_id, folder_name, title, genre, cover_url, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            publisher_id,
            folder_name,
            title,
            genre,
            cover_url,
            description
        ]);

        res.status(201).json({ game_id: result.insertId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE (admin)
exports.updateGame = async (req, res) => {
    try {
        const {
            folder_name,
            title,
            genre,
            cover_url,
            description
        } = req.body;

        await db.query(`
            UPDATE games
            SET folder_name = ?, title = ?, genre = ?, cover_url = ?, description = ?
            WHERE game_id = ?
        `, [
            folder_name,
            title,
            genre,
            cover_url,
            description,
            req.params.id
        ]);

        res.json({ message: "Game updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE (admin)
exports.deleteGame = async (req, res) => {
    try {
        await db.query(`
            DELETE FROM games
            WHERE game_id = ?
        `, [req.params.id]);

        res.json({ message: "Game deleted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};