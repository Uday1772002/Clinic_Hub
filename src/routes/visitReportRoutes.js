const express = require("express");
const {
  createVisitReport,
  getVisitReports,
  getVisitReportById,
  downloadVisitReport,
  updateVisitReport
} = require("../controllers/visitReportController");
const { authenticate, authorize } = require("../middleware/auth");

const visitReportRouter = express.Router();

/**
 * @swagger
 * /api/visit-reports:
 *   post:
 *     summary: Create a new visit report
 *     tags: [Visit Reports]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - chiefComplaint
 *               - diagnosis
 *             properties:
 *               appointmentId:
 *                 type: string
 *               chiefComplaint:
 *                 type: string
 *               symptoms:
 *                 type: array
 *               vitalSigns:
 *                 type: object
 *               diagnosis:
 *                 type: string
 *               prescriptions:
 *                 type: array
 *               labTests:
 *                 type: array
 *               followUpRequired:
 *                 type: boolean
 *               followUpDate:
 *                 type: string
 *                 format: date
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visit report created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Appointment not found
 */
visitReportRouter.post("/", authenticate, authorize("doctor", "admin"), createVisitReport);

/**
 * @swagger
 * /api/visit-reports:
 *   get:
 *     summary: Get all visit reports
 *     tags: [Visit Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
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
 *         description: Visit reports retrieved successfully
 */
visitReportRouter.get("/", authenticate, getVisitReports);

/**
 * @swagger
 * /api/visit-reports/{id}:
 *   get:
 *     summary: Get visit report by ID
 *     tags: [Visit Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit report retrieved successfully
 *       404:
 *         description: Visit report not found
 */
visitReportRouter.get("/:id", authenticate, getVisitReportById);

/**
 * @swagger
 * /api/visit-reports/{id}/download:
 *   get:
 *     summary: Download visit report as PDF
 *     tags: [Visit Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF downloaded successfully
 *       404:
 *         description: Visit report not found
 */
visitReportRouter.get("/:id/download", authenticate, downloadVisitReport);

/**
 * @swagger
 * /api/visit-reports/{id}:
 *   put:
 *     summary: Update visit report
 *     tags: [Visit Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Visit report updated successfully
 */
visitReportRouter.put("/:id", authenticate, authorize("doctor", "admin"), updateVisitReport);

module.exports = visitReportRouter;
