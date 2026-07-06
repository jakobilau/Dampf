const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const path = require("path");

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/friends", require("./routes/friends.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/games", require("./routes/games.routes"));
app.use("/api/library", require("./routes/library.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);

module.exports = app;