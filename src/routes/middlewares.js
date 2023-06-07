const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "unauthorized" });

  const token = authHeader.replace("Bearer ", "");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("jwt error:", err.message);
    return res.status(401).json({ message: "unauthorized" });
  }
  next();
};

module.exports = { authMiddleware };
