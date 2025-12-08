const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClinicHub API Documentation",
      version: "1.0.0",
      description: "Healthcare Management System API for managing appointments, patient records, and analytics",
      contact: {
        name: "ClinicHub Support",
        email: "support@clinichub.com"
      }
    },
    servers: [
      {
        url: "http://localhost:6000",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in HTTP-only cookie"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            role: { type: "string", enum: ["admin", "doctor", "patient"] },
            specialization: { type: "string" },
            licenseNumber: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patient: { $ref: "#/components/schemas/User" },
            doctor: { $ref: "#/components/schemas/User" },
            appointmentDate: { type: "string", format: "date" },
            appointmentTime: { type: "string" },
            duration: { type: "number" },
            status: { type: "string", enum: ["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"] },
            reason: { type: "string" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        PatientSummary: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patient: { $ref: "#/components/schemas/User" },
            bloodType: { type: "string" },
            allergies: { type: "array", items: { type: "object" } },
            chronicConditions: { type: "array", items: { type: "object" } },
            medications: { type: "array", items: { type: "object" } },
            height: { type: "number" },
            weight: { type: "number" }
          }
        },
        VisitReport: {
          type: "object",
          properties: {
            _id: { type: "string" },
            appointment: { $ref: "#/components/schemas/Appointment" },
            patient: { $ref: "#/components/schemas/User" },
            doctor: { $ref: "#/components/schemas/User" },
            visitDate: { type: "string", format: "date" },
            chiefComplaint: { type: "string" },
            diagnosis: { type: "string" },
            prescriptions: { type: "array", items: { type: "object" } },
            vitalSigns: { type: "object" }
          }
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" }
          }
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" }
          }
        }
      }
    },
    tags: [
      { name: "Authentication", description: "User authentication and authorization" },
      { name: "Appointments", description: "Appointment management" },
      { name: "Patients", description: "Patient medical summaries" },
      { name: "Visit Reports", description: "Post-visit medical reports" },
      { name: "Analytics", description: "Analytics and reporting" }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ClinicHub API Documentation"
  }));

  // Serve swagger spec as JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
