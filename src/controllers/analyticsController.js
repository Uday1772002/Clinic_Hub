/**
 * analyticsController.js — Aggregation-based analytics for the dashboard
 *
 * All endpoints here are admin-only (or doctor for their own stats).
 * They use MongoDB aggregation pipelines to produce real-time numbers.
 */

const Appointment = require("../models/appointment");
const User = require("../models/user");
const VisitReport = require("../models/visitReport");
const logger = require("../utils/logger");

// ──────────────────────────────────────────────────────────────────────
// Helper: build a date-range match stage from query params
// ──────────────────────────────────────────────────────────────────────
const buildDateMatch = (field, startDate, endDate) => {
  if (!startDate && !endDate) return {};
  const match = {};
  match[field] = {};
  if (startDate) match[field].$gte = new Date(startDate);
  if (endDate) match[field].$lte = new Date(endDate);
  return match;
};

/**
 * @desc    Dashboard overview — lightweight stats for the main dashboard
 * @route   GET /api/analytics/overview
 * @access  Private (Admin, Doctor)
 */
const getOverview = async (req, res, next) => {
  try {
    // Today's date bounds (midnight → midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Build a base match depending on role
    const baseMatch = {};
    if (req.user.role === "doctor") {
      baseMatch.doctor = req.user._id;
    }

    // Run all counts in parallel for speed
    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments({
        ...baseMatch,
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Appointment.countDocuments({ ...baseMatch, status: "completed" }),
      Appointment.countDocuments({ ...baseMatch, status: "cancelled" }),
      Appointment.countDocuments(baseMatch),
    ]);

    // Average duration across all appointments
    const durationAgg = await Appointment.aggregate([
      { $match: baseMatch },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
    ]);

    const avgDuration = durationAgg[0]?.avgDuration
      ? Math.round(durationAgg[0].avgDuration)
      : 30;

    // Completion rate
    const completionRate =
      totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
        : "0";

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        completedAppointments,
        cancelledAppointments,
        totalAppointments,
        avgDuration,
        completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment analytics
 * @route   GET /api/analytics/appointments
 * @access  Private (Admin)
 */
const getAppointmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, doctorId } = req.query;

    let matchStage = {};

    // Date range filter
    if (startDate || endDate) {
      matchStage.appointmentDate = {};
      if (startDate) matchStage.appointmentDate.$gte = new Date(startDate);
      if (endDate) matchStage.appointmentDate.$lte = new Date(endDate);
    }

    // Doctor filter
    if (doctorId) {
      matchStage.doctor = doctorId;
    }

    // Total appointments by status
    const statusBreakdown = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Appointments per doctor
    const appointmentsPerDoctor = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$doctor",
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 1,
          doctorName: {
            $concat: ["$doctor.firstName", " ", "$doctor.lastName"],
          },
          specialization: "$doctor.specialization",
          totalAppointments: 1,
          completedAppointments: 1,
          cancelledAppointments: 1,
        },
      },
    ]);

    // Daily appointment trends
    const dailyTrends = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Peak hours analysis
    const peakHours = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$appointmentTime",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Most common reasons
    const commonReasons = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Total statistics
    const totalStats = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          avgDuration: { $avg: "$duration" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        appointmentsPerDoctor,
        dailyTrends,
        peakHours,
        commonReasons,
        totalStats: totalStats[0] || { totalAppointments: 0, avgDuration: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient visit analytics
 * @route   GET /api/analytics/patients
 * @access  Private (Admin)
 */
const getPatientAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Total patients by role
    const patientCount = await User.countDocuments({ role: "patient" });
    const doctorCount = await User.countDocuments({ role: "doctor" });

    // Patient visit frequency
    const patientVisitFrequency = await Appointment.aggregate([
      { $match: { status: "completed", ...matchStage } },
      {
        $group: {
          _id: "$patient",
          visitCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $project: {
          _id: 1,
          patientName: {
            $concat: ["$patient.firstName", " ", "$patient.lastName"],
          },
          email: "$patient.email",
          visitCount: 1,
        },
      },
      { $sort: { visitCount: -1 } },
      { $limit: 20 },
    ]);

    // New patients over time
    const newPatientsOverTime = await User.aggregate([
      {
        $match: {
          role: "patient",
          ...matchStage,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Age distribution (if we had age data)
    // This would require adding birthdate to user model

    res.status(200).json({
      success: true,
      data: {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        patientVisitFrequency,
        newPatientsOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor performance metrics
 * @route   GET /api/analytics/doctors/:doctorId
 * @access  Private (Admin, Doctor - own stats)
 */
const getDoctorPerformance = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    // Authorization check
    if (req.user.role === "doctor" && doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let matchStage = { doctor: doctorId };

    if (startDate || endDate) {
      matchStage.appointmentDate = {};
      if (startDate) matchStage.appointmentDate.$gte = new Date(startDate);
      if (endDate) matchStage.appointmentDate.$lte = new Date(endDate);
    }

    const performance = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          noShowAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "no-show"] }, 1, 0] },
          },
        },
      },
    ]);

    // Total visit reports created
    const reportCount = await VisitReport.countDocuments({
      doctor: doctorId,
      ...(startDate || endDate
        ? {
            visitDate: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) }),
            },
          }
        : {}),
    });

    // Unique patients treated
    const uniquePatients = await Appointment.distinct("patient", matchStage);

    res.status(200).json({
      success: true,
      data: {
        ...performance[0],
        totalReportsGenerated: reportCount,
        uniquePatientsTreated: uniquePatients.length,
        completionRate: performance[0]
          ? (
              (performance[0].completedAppointments /
                performance[0].totalAppointments) *
              100
            ).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getAppointmentAnalytics,
  getPatientAnalytics,
  getDoctorPerformance,
};
