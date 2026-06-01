const db = require("../db");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ? AND password_hash = ?",
    [username, password]
  );

  // console.log(rows,password,username);

  if (rows.length === 0) {
    return res.status(401).json({ error: "Invalid login" });
  }

  res.json({ message: "Login successful" });
};