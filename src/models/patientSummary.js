const mongoose = require("mongoose");

const patientSummarySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown"
    },
    allergies: [{
      name: String,
      severity: {
        type: String,
        enum: ["mild", "moderate", "severe"]
      },
      addedDate: {
        type: Date,
        default: Date.now
      }
    }],
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: {
        type: String,
        enum: ["active", "controlled", "resolved"],
        default: "active"
      }
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    vaccinations: [{
      name: String,
      date: Date,
      nextDueDate: Date
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    height: Number, // in cm
    weight: Number, // in kg
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const PatientSummary = mongoose.model("PatientSummary", patientSummarySchema);

module.exports = PatientSummary;
