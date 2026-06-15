const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const testRoutes = require("./routes/testRoutes");

app.use("/test", testRoutes);

const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Express Backend running");
});

const auth = require("./middleware/auth.middleware");

const userRoutes = require("./routes/user.routes");

app.use("/api", userRoutes);


const messageRoutes = require("./routes/messages.routes");

app.use("/api/messages", messageRoutes);


const friendRoutes = require("./routes/friends.routes");

app.use("/api/friends", friendRoutes);

