/**
 * VisitReport model — clinical documentation for a completed visit
 *
 * Each report is tied 1-to-1 with an Appointment (enforced via a
 * unique index).  It stores vitals, diagnosis, prescriptions, lab
 * orders and optional follow-up scheduling.
 */

const mongoose = require("mongoose");

const visitReportSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    symptoms: [String],
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
      height: Number,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    prescriptions: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    labTests: [
      {
        testName: String,
        orderedDate: Date,
        status: {
          type: String,
          enum: ["ordered", "completed", "pending"],
          default: "ordered",
        },
      },
    ],
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
    additionalNotes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

visitReportSchema.index({ patient: 1, visitDate: -1 });
visitReportSchema.index({ doctor: 1, visitDate: -1 });

const VisitReport = mongoose.model("VisitReport", visitReportSchema);

module.exports = VisitReport;
