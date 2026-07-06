const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const socketModule = require("./sockets");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://localhost:5173",
      "https://10.72.100.35"
    ],
    credentials: true,
  },
});

socketModule.init(io);

server.listen(3000, () => {
  console.log("Backend running");
});