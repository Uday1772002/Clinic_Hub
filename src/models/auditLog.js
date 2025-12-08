const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_APPOINTMENT",
        "UPDATE_APPOINTMENT",
        "CANCEL_APPOINTMENT",
        "CREATE_PATIENT_SUMMARY",
        "UPDATE_PATIENT_SUMMARY",
        "CREATE_VISIT_REPORT",
        "UPDATE_VISIT_REPORT",
        "LOGIN",
        "LOGOUT",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER"
      ]
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["Appointment", "PatientSummary", "VisitReport", "User", "Auth"]
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    changes: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: false
  }
);

// Index for efficient queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
