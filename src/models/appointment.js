const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"]
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor is required"]
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"]
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"]
    },
    duration: {
      type: Number,
      default: 30, // duration in minutes
      required: true
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "scheduled"
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"]
    },
    notes: {
      type: String
    },
    cancelReason: {
      type: String
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

// Prevent double booking
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $nin: ["cancelled", "no-show"] } 
    }
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
