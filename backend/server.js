const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const socketModule = require("./sockets");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

socketModule.init(io);

server.listen(3000, () => {
  console.log("Backend running");
});