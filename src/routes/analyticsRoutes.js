const express = require("express");
const {
  getAppointmentAnalytics,
  getPatientAnalytics,
  getDoctorPerformance
} = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/auth");

const analyticsRouter = express.Router();

/**
 * @swagger
 * /api/analytics/appointments:
 *   get:
 *     summary: Get appointment analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       403:
 *         description: Access denied
 */
analyticsRouter.get("/appointments", authenticate, authorize("admin"), getAppointmentAnalytics);

/**
 * @swagger
 * /api/analytics/patients:
 *   get:
 *     summary: Get patient analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       403:
 *         description: Access denied
 */
analyticsRouter.get("/patients", authenticate, authorize("admin"), getPatientAnalytics);

/**
 * @swagger
 * /api/analytics/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor performance metrics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 *       403:
 *         description: Access denied
 */
analyticsRouter.get("/doctors/:doctorId", authenticate, authorize("admin", "doctor"), getDoctorPerformance);

module.exports = analyticsRouter;
