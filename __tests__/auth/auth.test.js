/**
 * Auth integration tests
 *
 * Uses a local test database (clinichub_test) — NOT mongodb-memory-server.
 * Each suite cleans up after itself so test order doesn't matter.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/user");

const testDbUri =
  process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/clinichub_test";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Authentication API Tests", () => {
  describe("POST /api/auth/register", () => {
    const validPatientData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@test.com",
      password: "Test@1234",
      phone: "1234567890",
      role: "patient",
    };

    const validDoctorData = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@test.com",
      password: "Test@1234",
      phone: "9876543210",
      role: "doctor",
      specialization: "Cardiology",
      licenseNumber: "MD12345",
    };

    test("should register a new patient successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validPatientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(validPatientData.email);
      expect(response.body.data.user.role).toBe("patient");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toMatch(/token=/);
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    test("should register a new doctor successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validDoctorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("doctor");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toMatch(/token=/);
    });

    test("should fail to register with duplicate email", async () => {
      // Register first user
      await request(app).post("/api/auth/register").send(validPatientData);

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(validPatientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    test("should fail to register with invalid email", async () => {
      const invalidData = { ...validPatientData, email: "invalid-email" };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should fail to register with weak password", async () => {
      const weakPasswordData = { ...validPatientData, password: "weak" };
      const response = await request(app)
        .post("/api/auth/register")
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should fail to register doctor without specialization", async () => {
      const invalidDoctorData = { ...validDoctorData };
      delete invalidDoctorData.specialization;

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidDoctorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should fail to register with invalid phone number", async () => {
      const invalidPhoneData = { ...validPatientData, phone: "123" };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidPhoneData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        password: "Test@1234",
        phone: "1234567890",
        role: "patient",
      });
    });

    test("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "Test@1234",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toMatch(/token=/);
      expect(response.body.data.user.email).toBe("test@test.com");
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    test("should fail to login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "WrongPassword@123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    test("should fail to login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "Test@1234",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    test("should fail to login without email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          password: "Test@1234",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should fail to login without password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let cookies;
    let userId;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "me@test.com",
        password: "Test@1234",
        phone: "1234567890",
        role: "patient",
      });

      cookies = response.headers["set-cookie"];
      userId = response.body.data.user.id;
    });

    test("should get current user profile with valid cookie", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("me@test.com");
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    test("should fail to get profile without cookie", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.success).toBe(false);
    });

    test("should fail to get profile with invalid cookie", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", ["token=invalid_token"])
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/profile", () => {
    let cookies;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "profile@test.com",
        password: "Test@1234",
        phone: "1234567890",
        role: "patient",
      });

      cookies = response.headers["set-cookie"];
    });

    test("should update user profile successfully", async () => {
      const response = await request(app)
        .put("/api/auth/profile")
        .set("Cookie", cookies)
        .send({
          firstName: "Updated",
          lastName: "Name",
          phone: "9876543210",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe("Updated");
      expect(response.body.data.user.lastName).toBe("Name");
      expect(response.body.data.user.phone).toBe("9876543210");
    });

    test("should fail to update profile without authentication", async () => {
      const response = await request(app)
        .put("/api/auth/profile")
        .send({
          firstName: "Updated",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test("should fail to update with invalid phone number", async () => {
      const response = await request(app)
        .put("/api/auth/profile")
        .set("Cookie", cookies)
        .send({
          phone: "123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
