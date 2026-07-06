const onlineUsers = new Map();

let io = null;

function init(ioInstance) {
  io = ioInstance;

  io.on("connection", (socket) => {
    console.log("connected:", socket.id);

    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });

socket.on("friend_request_live", ({ toUserId, fromUser }) => {
  const targetSocketId = onlineUsers.get(toUserId);

  if (!targetSocketId) return;

  io.to(targetSocketId).emit("friend_request_popup", {
    fromUser
  });
});

  });
}

function getIO() {
  return io;
}

function getOnlineUsers() {
  return onlineUsers;
}

module.exports = {
  init,
  getIO,
  getOnlineUsers,
};