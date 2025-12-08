const PatientSummary = require("../models/patientSummary");
const User = require("../models/user");
const logger = require("../utils/logger");
const { createAuditLog } = require("../utils/auditLogger");

/**
 * @desc    Get patient summary
 * @route   GET /api/patients/:patientId/summary
 * @access  Private (Doctor, Admin, Patient - own record)
 */
const getPatientSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Authorization check
    if (
      req.user.role === "patient" && patientId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    let summary = await PatientSummary.findOne({ patient: patientId })
      .populate("patient", "firstName lastName email phone")
      .populate("medications.prescribedBy", "firstName lastName specialization")
      .populate("lastUpdatedBy", "firstName lastName");

    // Create summary if it doesn't exist
    if (!summary) {
      summary = await PatientSummary.create({ patient: patientId });
      await summary.populate("patient", "firstName lastName email phone");
    }

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient summary
 * @route   PUT /api/patients/:patientId/summary
 * @access  Private (Doctor, Admin)
 */
const updatePatientSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Find or create summary
    let summary = await PatientSummary.findOne({ patient: patientId });

    if (!summary) {
      summary = await PatientSummary.create({
        patient: patientId,
        ...updateData,
        lastUpdatedBy: req.user.id
      });
    } else {
      // Update fields
      Object.keys(updateData).forEach(key => {
        summary[key] = updateData[key];
      });
      summary.lastUpdatedBy = req.user.id;
      await summary.save();
    }

    await summary.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "medications.prescribedBy", select: "firstName lastName specialization" },
      { path: "lastUpdatedBy", select: "firstName lastName" }
    ]);

    // Create audit log
    await createAuditLog(req.user.id, "UPDATE_PATIENT_SUMMARY", "PatientSummary", summary._id, updateData, req);

    logger.info(`Patient summary updated: ${summary._id}`);

    res.status(200).json({
      success: true,
      message: "Patient summary updated successfully",
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add medication to patient summary
 * @route   POST /api/patients/:patientId/summary/medications
 * @access  Private (Doctor, Admin)
 */
const addMedication = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { name, dosage, frequency, startDate, endDate } = req.body;

    let summary = await PatientSummary.findOne({ patient: patientId });

    if (!summary) {
      summary = await PatientSummary.create({ patient: patientId });
    }

    summary.medications.push({
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      prescribedBy: req.user.id,
      isActive: true
    });

    summary.lastUpdatedBy = req.user.id;
    await summary.save();

    await summary.populate([
      { path: "patient", select: "firstName lastName email" },
      { path: "medications.prescribedBy", select: "firstName lastName specialization" }
    ]);

    // Create audit log
    await createAuditLog(req.user.id, "UPDATE_PATIENT_SUMMARY", "PatientSummary", summary._id, { action: "add_medication", medication: { name, dosage } }, req);

    logger.info(`Medication added to patient summary: ${summary._id}`);

    res.status(200).json({
      success: true,
      message: "Medication added successfully",
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add allergy to patient summary
 * @route   POST /api/patients/:patientId/summary/allergies
 * @access  Private (Doctor, Admin)
 */
const addAllergy = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { name, severity } = req.body;

    let summary = await PatientSummary.findOne({ patient: patientId });

    if (!summary) {
      summary = await PatientSummary.create({ patient: patientId });
    }

    summary.allergies.push({
      name,
      severity,
      addedDate: new Date()
    });

    summary.lastUpdatedBy = req.user.id;
    await summary.save();

    await summary.populate("patient", "firstName lastName email");

    // Create audit log
    await createAuditLog(req.user.id, "UPDATE_PATIENT_SUMMARY", "PatientSummary", summary._id, { action: "add_allergy", allergy: { name, severity } }, req);

    logger.info(`Allergy added to patient summary: ${summary._id}`);

    res.status(200).json({
      success: true,
      message: "Allergy added successfully",
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientSummary,
  updatePatientSummary,
  addMedication,
  addAllergy
};
