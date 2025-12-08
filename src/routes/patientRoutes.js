const express = require("express");
const {
  getPatientSummary,
  updatePatientSummary,
  addMedication,
  addAllergy
} = require("../controllers/patientController");
const { authenticate, authorize } = require("../middleware/auth");

const patientRouter = express.Router();

/**
 * @swagger
 * /api/patients/{patientId}/summary:
 *   get:
 *     summary: Get patient summary
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient summary retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Patient not found
 */
patientRouter.get("/:patientId/summary", authenticate, getPatientSummary);

/**
 * @swagger
 * /api/patients/{patientId}/summary:
 *   put:
 *     summary: Update patient summary
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *               allergies:
 *                 type: array
 *               chronicConditions:
 *                 type: array
 *               medications:
 *                 type: array
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Patient summary updated successfully
 *       403:
 *         description: Access denied
 */
patientRouter.put("/:patientId/summary", authenticate, authorize("doctor", "admin"), updatePatientSummary);

/**
 * @swagger
 * /api/patients/{patientId}/summary/medications:
 *   post:
 *     summary: Add medication to patient summary
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dosage
 *               - frequency
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Medication added successfully
 */
patientRouter.post("/:patientId/summary/medications", authenticate, authorize("doctor", "admin"), addMedication);

/**
 * @swagger
 * /api/patients/{patientId}/summary/allergies:
 *   post:
 *     summary: Add allergy to patient summary
 *     tags: [Patients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - severity
 *             properties:
 *               name:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [mild, moderate, severe]
 *     responses:
 *       200:
 *         description: Allergy added successfully
 */
patientRouter.post("/:patientId/summary/allergies", authenticate, authorize("doctor", "admin"), addAllergy);

module.exports = patientRouter;
