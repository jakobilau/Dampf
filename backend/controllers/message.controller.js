const db = require("../db");
const socketModule = require("../sockets");

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    const [rows] = await db.query(
      `
      SELECT *
      FROM messages
      WHERE
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      `,
      [userId, friendId, friendId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES (?, ?, ?)`,
      [senderId, receiverId, content]
    );

    const message = {
      message_id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    };

    const onlineUsers = socketModule.getOnlineUsers();
    const io = socketModule.getIO();

    const receiverSocket = onlineUsers?.get(Number(receiverId));

    if (receiverSocket) {
    console.log("📤 EMIT new_message to socket:", receiverSocket);

      io.to(receiverSocket).emit("new_message", message);
    }

    res.json(message);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};