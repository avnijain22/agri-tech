const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Checks the JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Role-based access: only admins pass
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };
