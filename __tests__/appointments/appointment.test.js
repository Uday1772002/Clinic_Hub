/**
 * Appointment integration tests
 *
 * Covers creating, listing, updating and cancelling appointments
 * for patient, doctor and admin roles.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/user");
const Appointment = require("../../src/models/appointment");

const testDbUri =
  process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/clinichub_test";

let patientCookies, doctorCookies, adminCookies;
let patientId, doctorId, adminId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }

  // Create test users
  const patientRes = await request(app).post("/api/auth/register").send({
    firstName: "Patient",
    lastName: "Test",
    email: "patient@test.com",
    password: "Test@1234",
    phone: "1234567890",
    role: "patient",
  });

  patientCookies = patientRes.headers["set-cookie"];
  patientId = patientRes.body.data.user.id;

  const doctorRes = await request(app).post("/api/auth/register").send({
    firstName: "Doctor",
    lastName: "Test",
    email: "doctor@test.com",
    password: "Test@1234",
    phone: "9876543210",
    role: "doctor",
    specialization: "General Medicine",
    licenseNumber: "MD123",
  });

  doctorCookies = doctorRes.headers["set-cookie"];
  doctorId = doctorRes.body.data.user.id;

  const adminRes = await request(app).post("/api/auth/register").send({
    firstName: "Admin",
    lastName: "Test",
    email: "admin@test.com",
    password: "Test@1234",
    phone: "5555555555",
    role: "admin",
  });

  adminCookies = adminRes.headers["set-cookie"];
  adminId = adminRes.body.data.user.id;
});

afterAll(async () => {
  await Appointment.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Appointment.deleteMany({});
});

describe("Appointment API Tests", () => {
  describe("POST /api/appointments", () => {
    const validAppointment = {
      appointmentDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      appointmentTime: "10:00",
      duration: 30,
      reason: "Regular checkup",
    };

    test("should create appointment as patient", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          ...validAppointment,
          doctorId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment).toHaveProperty("_id");
      expect(response.body.data.appointment.status).toBe("scheduled");
      expect(response.body.data.appointment.reason).toBe("Regular checkup");
    });

    test("should create appointment as admin for a patient", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", adminCookies)
        .send({
          ...validAppointment,
          doctorId,
          patientId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.patient._id).toBe(patientId);
    });

    test("should fail to create appointment without authentication", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .send({
          ...validAppointment,
          doctorId,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test("should fail to create appointment as doctor", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", doctorCookies)
        .send({
          ...validAppointment,
          doctorId,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test("should fail to create appointment with invalid doctor", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          ...validAppointment,
          doctorId: new mongoose.Types.ObjectId(),
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Doctor not found");
    });

    test("should fail to create appointment for same time slot", async () => {
      // Create first appointment
      await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          ...validAppointment,
          doctorId,
        });

      // Try to create second appointment for same time
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          ...validAppointment,
          doctorId,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("conflicts");
    });

    test("should fail to create appointment without required fields", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/appointments", () => {
    beforeEach(async () => {
      // Create test appointments
      await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
          appointmentDate: new Date(Date.now() + 86400000).toISOString(),
          appointmentTime: "10:00",
          reason: "Test appointment 1",
        });

      await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
          appointmentDate: new Date(Date.now() + 172800000).toISOString(),
          appointmentTime: "14:00",
          reason: "Test appointment 2",
        });
    });

    test("should get all appointments for patient", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("Cookie", patientCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    test("should get all appointments for doctor", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("Cookie", doctorCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toHaveLength(2);
    });

    test("should filter appointments by status", async () => {
      const response = await request(app)
        .get("/api/appointments?status=scheduled")
        .set("Cookie", patientCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.appointments.forEach((apt) => {
        expect(apt.status).toBe("scheduled");
      });
    });

    test("should fail to get appointments without authentication", async () => {
      const response = await request(app).get("/api/appointments").expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/appointments/:id", () => {
    let appointmentId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
          appointmentDate: new Date(Date.now() + 86400000).toISOString(),
          appointmentTime: "10:00",
          reason: "Test appointment",
        });

      appointmentId = response.body.data.appointment._id;
    });

    test("should get appointment by ID as patient", async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Cookie", patientCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment._id).toBe(appointmentId);
    });

    test("should get appointment by ID as doctor", async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Cookie", doctorCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment._id).toBe(appointmentId);
    });

    test("should fail to get appointment with invalid ID", async () => {
      const response = await request(app)
        .get(`/api/appointments/${new mongoose.Types.ObjectId()}`)
        .set("Cookie", patientCookies)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/appointments/:id", () => {
    let appointmentId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
          appointmentDate: new Date(Date.now() + 86400000).toISOString(),
          appointmentTime: "10:00",
          reason: "Test appointment",
        });

      appointmentId = response.body.data.appointment._id;
    });

    test("should update appointment as doctor", async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set("Cookie", doctorCookies)
        .send({
          status: "confirmed",
          notes: "Patient confirmed",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe("confirmed");
      expect(response.body.data.appointment.notes).toBe("Patient confirmed");
    });

    test("should update appointment as admin", async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set("Cookie", adminCookies)
        .send({
          status: "completed",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe("completed");
    });

    test("should fail to update appointment as patient", async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set("Cookie", patientCookies)
        .send({
          status: "confirmed",
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    let appointmentId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", patientCookies)
        .send({
          doctorId,
          appointmentDate: new Date(Date.now() + 86400000).toISOString(),
          appointmentTime: "10:00",
          reason: "Test appointment",
        });

      appointmentId = response.body.data.appointment._id;
    });

    test("should cancel appointment as patient", async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set("Cookie", patientCookies)
        .send({
          cancelReason: "Personal reasons",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe("cancelled");
      expect(response.body.data.appointment.cancelReason).toBe(
        "Personal reasons",
      );
    });

    test("should cancel appointment as doctor", async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set("Cookie", doctorCookies)
        .send({
          cancelReason: "Emergency",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe("cancelled");
    });

    test("should fail to cancel already cancelled appointment", async () => {
      // Cancel first time
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set("Cookie", patientCookies)
        .send({
          cancelReason: "Test",
        });

      // Try to cancel again
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set("Cookie", patientCookies)
        .send({
          cancelReason: "Test again",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already cancelled");
    });
  });
});
