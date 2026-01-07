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
        message: "No token provided. Please authenticate.",
        code: "NO_TOKEN",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      logger.error("Token verification failed:", error.message);
      // Clear invalid cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
        code: "INVALID_TOKEN",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      // Clear cookie if user not found
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please try again.",
      code: "AUTH_ERROR",
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${roles.join(
          ", "
        )}`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
