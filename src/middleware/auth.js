const { verifyToken } = require("../utils/jwt");
const User = require("../models/user");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie only
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please authenticate."
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token invalid."
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated."
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid token."
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${roles.join(", ")}`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
