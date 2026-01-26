/**
 * database.js — MongoDB connection helper
 *
 * Reads MONGODB_URI from environment variables and connects via Mongoose.
 * If running MongoDB in OrbStack / Docker, the URI is typically:
 *   mongodb://localhost:27017/clinic_hub
 */

const mongoose = require("mongoose");
const logger = require("../utils/logger");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
