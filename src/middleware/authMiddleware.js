const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(403)
      .json({ message: "Token is required for authentication." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Check if the user exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User data not found. Please log in again." });
    }

    req.user = decoded; // Store user information from token
    next();
  });
};

module.exports = authMiddleware;
