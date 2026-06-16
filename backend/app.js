const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/friends", require("./routes/friends.routes"));
app.use("/api/messages", require("./routes/messages.routes"));

module.exports = app;