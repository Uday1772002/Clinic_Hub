/**
 * socket.js — Socket.IO initialisation & event handling
 *
 * Authenticates every socket connection using a JWT token provided
 * via `socket.handshake.auth.token` or the Authorization header.
 * After auth, each user is placed in a private room (`user_<id>`)
 * so the server can push targeted real-time events.
 */

const socketIo = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const logger = require("../utils/logger");

const initializeSocket = (server) => {
  // Allow the React dev-server origin for WebSocket connections too
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  // Supports three token sources:
  //   1. socket.handshake.auth.token  (explicit from client)
  //   2. Authorization: Bearer <token> header
  //   3. httpOnly "token" cookie (sent via withCredentials + polling)
  io.use((socket, next) => {
    try {
      // Parse cookies from the handshake headers ("token=abc; other=xyz")
      const cookieHeader = socket.handshake.headers.cookie || "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...v] = c.trim().split("=");
          return [k, v.join("=")];
        }),
      );

      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1] ||
        cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      logger.info(
        `Socket authenticated: User ${socket.userId} (${socket.userRole})`,
      );
      next();
    } catch (error) {
      logger.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    logger.info(`New socket connection: ${socket.id} - User: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Send connection confirmation
    socket.emit("connected", {
      message: "Connected to ClinicHub real-time server",
      userId: socket.userId,
      role: socket.userRole,
    });

    // Handle custom events
    socket.on("join_room", (room) => {
      socket.join(room);
      logger.info(`User ${socket.userId} joined room: ${room}`);
      socket.emit("room_joined", { room });
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      logger.info(`User ${socket.userId} left room: ${room}`);
      socket.emit("room_left", { room });
    });

    // Handle appointment status requests
    socket.on("request_appointment_status", async (appointmentId) => {
      try {
        const Appointment = require("../models/appointment");
        const appointment = await Appointment.findById(appointmentId)
          .populate("patient", "firstName lastName")
          .populate("doctor", "firstName lastName");

        if (appointment) {
          // Check authorization
          if (
            socket.userId === appointment.patient._id.toString() ||
            socket.userId === appointment.doctor._id.toString() ||
            socket.userRole === "admin"
          ) {
            socket.emit("appointment_status", appointment);
          } else {
            socket.emit("error", { message: "Access denied" });
          }
        } else {
          socket.emit("error", { message: "Appointment not found" });
        }
      } catch (error) {
        logger.error("Error fetching appointment status:", error.message);
        socket.emit("error", { message: "Error fetching appointment status" });
      }
    });

    // Handle typing indicators (for potential chat feature)
    socket.on("typing", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id} - User: ${socket.userId}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error.message);
    });
  });

  // Helper function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
    logger.debug(`Emitted ${event} to user ${userId}`);
  };

  // Helper function to emit to multiple users
  io.emitToUsers = (userIds, event, data) => {
    userIds.forEach((userId) => {
      io.to(`user_${userId}`).emit(event, data);
    });
    logger.debug(`Emitted ${event} to ${userIds.length} users`);
  };

  // Helper function to broadcast to all users with specific role
  io.emitToRole = (role, event, data) => {
    io.sockets.sockets.forEach((socket) => {
      if (socket.userRole === role) {
        socket.emit(event, data);
      }
    });
    logger.debug(`Broadcasted ${event} to all ${role}s`);
  };

  return io;
};

module.exports = initializeSocket;
