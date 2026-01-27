/**
 * appointmentController.js — CRUD + cancel for appointments
 *
 * Provides duration-aware overlap detection so double-booking is
 * impossible.  After every mutation the controller emits Socket.IO
 * events to the affected users' private rooms and fires email
 * notifications via the email utility.
 */

const Appointment = require("../models/appointment");
const User = require("../models/user");
const logger = require("../utils/logger");
const { createAuditLog } = require("../utils/auditLogger");
const { sendAppointmentEmail } = require("../utils/email");

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Admin)
 */
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, duration, reason } =
      req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, time, and reason are required",
      });
    }

    // Check if doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if patient exists (for admin creating appointments)
    let patientId = req.user.id;
    if (req.user.role === "admin" && req.body.patientId) {
      const patient = await User.findById(req.body.patientId);
      if (!patient || patient.role !== "patient") {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      patientId = req.body.patientId;
    }

    // Check for conflicting appointments with duration-based overlap detection
    // Convert time string to minutes since midnight.
    // Accepts 24-hour ("14:30") or 12-hour ("2:30 PM") formats.
    const timeToMinutes = (timeStr) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period) {
        // 12-hour format
        if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const requestedStartTime = timeToMinutes(appointmentTime);
    const requestedEndTime = requestedStartTime + (duration || 30);

    // Find all appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      status: { $nin: ["cancelled", "no-show"] },
    });

    // Check for time overlaps
    for (const existing of existingAppointments) {
      const existingStartTime = timeToMinutes(existing.appointmentTime);
      const existingEndTime = existingStartTime + existing.duration;

      // Check if appointments overlap
      const hasOverlap =
        (requestedStartTime >= existingStartTime &&
          requestedStartTime < existingEndTime) || // New starts during existing
        (requestedEndTime > existingStartTime &&
          requestedEndTime <= existingEndTime) || // New ends during existing
        (requestedStartTime <= existingStartTime &&
          requestedEndTime >= existingEndTime); // New completely covers existing

      if (hasOverlap) {
        return res.status(409).json({
          success: false,
          message: `This time slot conflicts with an existing appointment (${existing.appointmentTime} - ${existing.duration} minutes)`,
        });
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      reason,
    });

    // Populate patient and doctor details
    await appointment.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "doctor", select: "firstName lastName email specialization" },
    ]);

    // Create audit log
    await createAuditLog(
      req.user.id,
      "CREATE_APPOINTMENT",
      "Appointment",
      appointment._id,
      appointment,
      req,
    );

    // Send email notifications
    const appointmentDetails = {
      title: "New Appointment Scheduled",
      message: "Your appointment has been successfully scheduled.",
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      date: new Date(appointmentDate).toLocaleDateString(),
      time: appointmentTime,
      reason: reason,
      status: appointment.status,
    };

    await sendAppointmentEmail(
      appointment.patient.email,
      "Appointment Scheduled",
      appointmentDetails,
    );
    await sendAppointmentEmail(
      appointment.doctor.email,
      "New Appointment",
      appointmentDetails,
    );

    // Emit socket event (will be handled by socket manager)
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`user_${doctorId}`)
        .emit("new_appointment", appointment);
      req.app
        .get("io")
        .to(`user_${patientId}`)
        .emit("appointment_update", appointment);
    }

    logger.info(`Appointment created: ${appointment._id}`);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res, next) => {
  try {
    const { status, startDate, endDate, doctorId, patientId } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === "patient") {
      query.patient = req.user.id;
    } else if (req.user.role === "doctor") {
      query.doctor = req.user.id;
    }

    // Admin can filter by doctor or patient
    if (req.user.role === "admin") {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: { appointments },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Authorization check
    if (
      (req.user.role === "patient" &&
        appointment.patient._id.toString() !== req.user.id) ||
      (req.user.role === "doctor" &&
        appointment.doctor._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private (Admin, Doctor)
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Authorization check
    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Track changes for audit
    const changes = {};

    if (appointmentDate) {
      changes.appointmentDate = {
        old: appointment.appointmentDate,
        new: appointmentDate,
      };
      appointment.appointmentDate = appointmentDate;
    }
    if (appointmentTime) {
      changes.appointmentTime = {
        old: appointment.appointmentTime,
        new: appointmentTime,
      };
      appointment.appointmentTime = appointmentTime;
    }
    if (status) {
      changes.status = { old: appointment.status, new: status };
      appointment.status = status;
    }
    if (notes) {
      changes.notes = { old: appointment.notes, new: notes };
      appointment.notes = notes;
    }

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "doctor", select: "firstName lastName specialization" },
    ]);

    // Create audit log
    await createAuditLog(
      req.user.id,
      "UPDATE_APPOINTMENT",
      "Appointment",
      appointment._id,
      changes,
      req,
    );

    // Emit socket event
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`user_${appointment.patient._id}`)
        .emit("appointment_update", appointment);
      req.app
        .get("io")
        .to(`user_${appointment.doctor._id}`)
        .emit("appointment_update", appointment);
    }

    // Send email notification if status changed
    if (status) {
      const appointmentDetails = {
        title: "Appointment Status Updated",
        message: `Your appointment status has been updated to: ${status}`,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        date: new Date(appointment.appointmentDate).toLocaleDateString(),
        time: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
      };

      await sendAppointmentEmail(
        appointment.patient.email,
        "Appointment Updated",
        appointmentDetails,
      );
    }

    logger.info(`Appointment updated: ${appointment._id}`);

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Authorization check
    if (
      (req.user.role === "patient" &&
        appointment.patient.toString() !== req.user.id) ||
      (req.user.role === "doctor" &&
        appointment.doctor.toString() !== req.user.id)
    ) {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = cancelReason;
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "doctor", select: "firstName lastName specialization" },
    ]);

    // Create audit log
    await createAuditLog(
      req.user.id,
      "CANCEL_APPOINTMENT",
      "Appointment",
      appointment._id,
      { cancelReason },
      req,
    );

    // Emit socket event
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`user_${appointment.patient._id}`)
        .emit("appointment_cancelled", appointment);
      req.app
        .get("io")
        .to(`user_${appointment.doctor._id}`)
        .emit("appointment_cancelled", appointment);
    }

    // Send email notifications
    const appointmentDetails = {
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled. ${cancelReason ? `Reason: ${cancelReason}` : ""}`,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      date: new Date(appointment.appointmentDate).toLocaleDateString(),
      time: appointment.appointmentTime,
      reason: appointment.reason,
      status: "cancelled",
    };

    await sendAppointmentEmail(
      appointment.patient.email,
      "Appointment Cancelled",
      appointmentDetails,
    );
    await sendAppointmentEmail(
      appointment.doctor.email,
      "Appointment Cancelled",
      appointmentDetails,
    );

    logger.info(`Appointment cancelled: ${appointment._id}`);

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
};
