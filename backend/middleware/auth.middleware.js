const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies?.token;
  console.log("Token from cookie:", token);

  if (!token) {
    return res.status(401).json({ message: "No auth" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};