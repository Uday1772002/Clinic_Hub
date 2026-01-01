import { useEffect } from "react";
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:6000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const useSocketEvent = (eventName, callback) => {
  useEffect(() => {
    const currentSocket = initSocket();
    currentSocket.on(eventName, callback);

    return () => {
      currentSocket.off(eventName, callback);
    };
  }, [eventName, callback]);
};

// Socket event types
export const SOCKET_EVENTS = {
  APPOINTMENT_CREATED: "appointmentCreated",
  APPOINTMENT_UPDATED: "appointmentUpdated",
  APPOINTMENT_CANCELLED: "appointmentCancelled",
};
