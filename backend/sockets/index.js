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