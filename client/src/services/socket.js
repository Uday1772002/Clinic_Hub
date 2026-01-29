/**
 * socket.js — Socket.IO client wrapper
 *
 * Provides helpers to initialise, disconnect, and listen to events
 * on a single shared Socket.IO connection.  The server authenticates
 * every socket via an httpOnly cookie that is automatically sent
 * when `withCredentials` is true and the first transport is polling.
 *
 * NOTE: The "polling" transport MUST come first so that the browser
 * includes cookies during the HTTP handshake.  Once authenticated
 * the connection upgrades to WebSocket automatically.
 */

import { useEffect } from "react";
import { io } from "socket.io-client";

let socket = null;

/**
 * Create (or return the existing) socket connection.
 * The cookie-based JWT is sent automatically via `withCredentials`.
 */
export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:6000", {
      withCredentials: true,
      // Polling first so the browser sends the auth cookie during the HTTP handshake
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }
  return socket;
};

/** Tear down the connection (e.g. on logout). */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/** Get the current socket instance (may be null). */
export const getSocket = () => socket;

/**
 * React hook — subscribe to a Socket.IO event for the lifetime of
 * the calling component.  Automatically cleans up on unmount.
 */
export const useSocketEvent = (eventName, callback) => {
  useEffect(() => {
    const currentSocket = initSocket();
    currentSocket.on(eventName, callback);

    return () => {
      currentSocket.off(eventName, callback);
    };
  }, [eventName, callback]);
};

/** Canonical event names emitted by the server. */
export const SOCKET_EVENTS = {
  APPOINTMENT_CREATED: "appointmentCreated",
  APPOINTMENT_UPDATED: "appointmentUpdated",
  APPOINTMENT_CANCELLED: "appointmentCancelled",
};
