const db = require("../db");

exports.getProfile = async (req, res) => {
    try {

        const [rows] = await db.query(
            `
            SELECT
                user_id,
                username,
                biography,
                profile_image_path
            FROM users
            WHERE user_id = ?
            `,
            [req.params.id]
        );

        if (!rows.length) {
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

exports.updateProfile = async (req, res) => {
    try {
        const { username, biography } = req.body;

        const [user] = await db.query(
            "SELECT username, biography FROM users WHERE user_id = ?",
            [req.user.id]
        );

        const current = user[0];

        await db.query(
            `
            UPDATE users
            SET
                username = ?,
                biography= ?
            WHERE user_id = ?
            `,
            [
                username ?? current.username,
                biography ?? current.biography,
                req.user.id,
            ]
        );

        res.json({ message: "Profile updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.updateAvatar = async (req, res) => {
    try {
        const fileUrl = `/uploads/avatars/${req.file.filename}`;

        await db.query(
            `UPDATE users SET profile_image_path = ? WHERE user_id = ?`,
            [fileUrl, req.user.id]
        );

        res.json({
            avatar_url: fileUrl,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error",
        });
    }
};