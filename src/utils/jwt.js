/**
 * jwt.js — Token generation & verification helpers
 *
 * Tokens carry `{ id, role }` and are signed with the secret from
 * the JWT_SECRET env-var.  Expiry is controlled by JWT_EXPIRE.
 */

const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
