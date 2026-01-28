/**
 * auditLogger.js — Persist every sensitive action to the AuditLog
 *
 * Called from controllers after creates, updates and auth events.
 * Failures are logged but never propagated, so they don’t break
 * the original request.
 */

const AuditLog = require("../models/auditLog");
const logger = require("./logger");

const createAuditLog = async (
  userId,
  action,
  resourceType,
  resourceId,
  changes,
  req,
) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });
    logger.info(`Audit log created: ${action} by user ${userId}`);
  } catch (error) {
    logger.error("Error creating audit log:", error.message);
  }
};

module.exports = {
  createAuditLog,
};
