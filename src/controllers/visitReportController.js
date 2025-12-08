const VisitReport = require("../models/visitReport");
const Appointment = require("../models/appointment");
const PDFDocument = require("pdfkit");
const logger = require("../utils/logger");
const { createAuditLog } = require("../utils/auditLogger");

/**
 * @desc    Create visit report
 * @route   POST /api/visit-reports
 * @access  Private (Doctor, Admin)
 */
const createVisitReport = async (req, res, next) => {
  try {
    const {
      appointmentId,
      chiefComplaint,
      symptoms,
      vitalSigns,
      diagnosis,
      prescriptions,
      labTests,
      followUpRequired,
      followUpDate,
      additionalNotes
    } = req.body;

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Authorization check
    if (req.user.role === "doctor" && appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if report already exists
    const existingReport = await VisitReport.findOne({ appointment: appointmentId });
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "Visit report already exists for this appointment"
      });
    }

    // Create visit report
    const visitReport = await VisitReport.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      visitDate: appointment.appointmentDate,
      chiefComplaint,
      symptoms,
      vitalSigns,
      diagnosis,
      prescriptions,
      labTests,
      followUpRequired,
      followUpDate,
      additionalNotes,
      createdBy: req.user.id
    });

    // Update appointment status to completed
    appointment.status = "completed";
    await appointment.save();

    await visitReport.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "doctor", select: "firstName lastName specialization" },
      { path: "appointment" }
    ]);

    // Create audit log
    await createAuditLog(req.user.id, "CREATE_VISIT_REPORT", "VisitReport", visitReport._id, visitReport, req);

    logger.info(`Visit report created: ${visitReport._id}`);

    res.status(201).json({
      success: true,
      message: "Visit report created successfully",
      data: { visitReport }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get visit reports
 * @route   GET /api/visit-reports
 * @access  Private
 */
const getVisitReports = async (req, res, next) => {
  try {
    const { patientId, doctorId, startDate, endDate } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === "patient") {
      query.patient = req.user.id;
    } else if (req.user.role === "doctor") {
      query.doctor = req.user.id;
    }

    // Admin can filter by patient or doctor
    if (req.user.role === "admin") {
      if (patientId) query.patient = patientId;
      if (doctorId) query.doctor = doctorId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const visitReports = await VisitReport.find(query)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visitReports.length,
      data: { visitReports }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get visit report by ID
 * @route   GET /api/visit-reports/:id
 * @access  Private
 */
const getVisitReportById = async (req, res, next) => {
  try {
    const visitReport = await VisitReport.findById(req.params.id)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment");

    if (!visitReport) {
      return res.status(404).json({
        success: false,
        message: "Visit report not found"
      });
    }

    // Authorization check
    if (
      req.user.role === "patient" && visitReport.patient._id.toString() !== req.user.id ||
      req.user.role === "doctor" && visitReport.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: { visitReport }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download visit report as PDF
 * @route   GET /api/visit-reports/:id/download
 * @access  Private
 */
const downloadVisitReport = async (req, res, next) => {
  try {
    const visitReport = await VisitReport.findById(req.params.id)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization licenseNumber")
      .populate("appointment");

    if (!visitReport) {
      return res.status(404).json({
        success: false,
        message: "Visit report not found"
      });
    }

    // Authorization check
    if (
      req.user.role === "patient" && visitReport.patient._id.toString() !== req.user.id ||
      req.user.role === "doctor" && visitReport.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=visit-report-${visitReport._id}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text("ClinicHub - Medical Visit Report", { align: "center" })
      .moveDown();

    doc.fontSize(10).text(`Report ID: ${visitReport._id}`, { align: "right" });
    doc.text(`Date: ${new Date(visitReport.visitDate).toLocaleDateString()}`, {
      align: "right"
    });
    doc.moveDown();

    // Patient Information
    doc.fontSize(14).text("Patient Information", { underline: true });
    doc.fontSize(10).moveDown(0.5);
    doc.text(`Name: ${visitReport.patient.firstName} ${visitReport.patient.lastName}`);
    doc.text(`Email: ${visitReport.patient.email}`);
    doc.text(`Phone: ${visitReport.patient.phone}`);
    doc.moveDown();

    // Doctor Information
    doc.fontSize(14).text("Doctor Information", { underline: true });
    doc.fontSize(10).moveDown(0.5);
    doc.text(`Name: Dr. ${visitReport.doctor.firstName} ${visitReport.doctor.lastName}`);
    doc.text(`Specialization: ${visitReport.doctor.specialization}`);
    doc.text(`License: ${visitReport.doctor.licenseNumber}`);
    doc.moveDown();

    // Chief Complaint
    doc.fontSize(14).text("Chief Complaint", { underline: true });
    doc.fontSize(10).moveDown(0.5);
    doc.text(visitReport.chiefComplaint);
    doc.moveDown();

    // Symptoms
    if (visitReport.symptoms && visitReport.symptoms.length > 0) {
      doc.fontSize(14).text("Symptoms", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      visitReport.symptoms.forEach(symptom => {
        doc.text(`• ${symptom}`);
      });
      doc.moveDown();
    }

    // Vital Signs
    if (visitReport.vitalSigns) {
      doc.fontSize(14).text("Vital Signs", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      const vs = visitReport.vitalSigns;
      if (vs.bloodPressure) doc.text(`Blood Pressure: ${vs.bloodPressure}`);
      if (vs.heartRate) doc.text(`Heart Rate: ${vs.heartRate} bpm`);
      if (vs.temperature) doc.text(`Temperature: ${vs.temperature}°F`);
      if (vs.respiratoryRate) doc.text(`Respiratory Rate: ${vs.respiratoryRate}/min`);
      if (vs.oxygenSaturation) doc.text(`Oxygen Saturation: ${vs.oxygenSaturation}%`);
      if (vs.weight) doc.text(`Weight: ${vs.weight} kg`);
      if (vs.height) doc.text(`Height: ${vs.height} cm`);
      doc.moveDown();
    }

    // Diagnosis
    doc.fontSize(14).text("Diagnosis", { underline: true });
    doc.fontSize(10).moveDown(0.5);
    doc.text(visitReport.diagnosis);
    doc.moveDown();

    // Prescriptions
    if (visitReport.prescriptions && visitReport.prescriptions.length > 0) {
      doc.fontSize(14).text("Prescriptions", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      visitReport.prescriptions.forEach((rx, index) => {
        doc.text(`${index + 1}. ${rx.medication}`);
        doc.text(`   Dosage: ${rx.dosage}`);
        doc.text(`   Frequency: ${rx.frequency}`);
        doc.text(`   Duration: ${rx.duration}`);
        if (rx.instructions) doc.text(`   Instructions: ${rx.instructions}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Lab Tests
    if (visitReport.labTests && visitReport.labTests.length > 0) {
      doc.fontSize(14).text("Lab Tests Ordered", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      visitReport.labTests.forEach((test, index) => {
        doc.text(`${index + 1}. ${test.testName} - Status: ${test.status}`);
      });
      doc.moveDown();
    }

    // Follow-up
    if (visitReport.followUpRequired) {
      doc.fontSize(14).text("Follow-up", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      doc.text(`Follow-up Required: Yes`);
      if (visitReport.followUpDate) {
        doc.text(`Follow-up Date: ${new Date(visitReport.followUpDate).toLocaleDateString()}`);
      }
      doc.moveDown();
    }

    // Additional Notes
    if (visitReport.additionalNotes) {
      doc.fontSize(14).text("Additional Notes", { underline: true });
      doc.fontSize(10).moveDown(0.5);
      doc.text(visitReport.additionalNotes);
      doc.moveDown();
    }

    // Footer
    doc
      .fontSize(8)
      .text(
        "This is a computer-generated report. For any queries, please contact ClinicHub.",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();

    logger.info(`Visit report downloaded: ${visitReport._id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update visit report
 * @route   PUT /api/visit-reports/:id
 * @access  Private (Doctor, Admin)
 */
const updateVisitReport = async (req, res, next) => {
  try {
    const visitReport = await VisitReport.findById(req.params.id);

    if (!visitReport) {
      return res.status(404).json({
        success: false,
        message: "Visit report not found"
      });
    }

    // Authorization check
    if (req.user.role === "doctor" && visitReport.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const updateData = req.body;
    Object.keys(updateData).forEach(key => {
      visitReport[key] = updateData[key];
    });

    await visitReport.save();

    await visitReport.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "doctor", select: "firstName lastName specialization" },
      { path: "appointment" }
    ]);

    // Create audit log
    await createAuditLog(req.user.id, "UPDATE_VISIT_REPORT", "VisitReport", visitReport._id, updateData, req);

    logger.info(`Visit report updated: ${visitReport._id}`);

    res.status(200).json({
      success: true,
      message: "Visit report updated successfully",
      data: { visitReport }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisitReport,
  getVisitReports,
  getVisitReportById,
  downloadVisitReport,
  updateVisitReport
};
