const express = require("express");
const app = express();

app.use(express.json());

const testRoutes = require("./routes/testRoutes");

app.use("/test", testRoutes);

const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});