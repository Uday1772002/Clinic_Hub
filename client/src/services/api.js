/**
 * api.js — Centralised Axios instance & API helpers
 *
 * Every request is sent with `withCredentials: true` so the httpOnly
 * JWT cookie is included automatically.  The response interceptor
 * handles 401/403 by clearing the Zustand auth store and redirecting.
 */

import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

// ── Axios instance (proxied by Vite in dev) ──────────────────────────
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends httpOnly cookie on every request
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config, // cookie is sent automatically
  (error) => Promise.reject(error),
);

// ── Response interceptor — global error handling ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    // Handle authentication / authorisation errors
    if (status === 401 || status === 403) {
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        if (
          errorCode === "INVALID_TOKEN" ||
          errorCode === "USER_NOT_FOUND" ||
          errorCode === "NO_TOKEN"
        ) {
          useAuthStore.getState().clearAuth();
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        } else if (errorCode === "ACCOUNT_DEACTIVATED") {
          useAuthStore.getState().clearAuth();
          toast.error(error.response?.data?.message || "Account deactivated");
          window.location.href = "/login";
        } else {
          toast.error(error.response?.data?.message || "Access denied");
        }
        return Promise.reject(error);
      }
    }

    // Show a toast for every other error (unless the caller opted out)
    const message = error.response?.data?.message || "An error occurred";
    if (!error.config?.skipErrorToast) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

// ── Auth API ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ── Appointments API ─────────────────────────────────────────────────
export const appointmentsAPI = {
  create: (data) => api.post("/appointments", data),
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, data) => api.delete(`/appointments/${id}`, { data }),
};

// ── Patients API ─────────────────────────────────────────────────────
// NOTE: medication / allergy routes live under /summary/*
export const patientsAPI = {
  getSummary: (patientId) => api.get(`/patients/${patientId}/summary`),
  updateSummary: (patientId, data) =>
    api.put(`/patients/${patientId}/summary`, data),
  addMedication: (patientId, data) =>
    api.post(`/patients/${patientId}/summary/medications`, data),
  addAllergy: (patientId, data) =>
    api.post(`/patients/${patientId}/summary/allergies`, data),
};

// ── Visit Reports API ────────────────────────────────────────────────
export const visitReportsAPI = {
  create: (data) => api.post("/visit-reports", data),
  getAll: (params) => api.get("/visit-reports", { params }),
  getById: (id) => api.get(`/visit-reports/${id}`),
  update: (id, data) => api.put(`/visit-reports/${id}`, data),
  downloadPDF: (id) =>
    api.get(`/visit-reports/${id}/download`, { responseType: "blob" }),
};

// ── Analytics API ────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview"),
  getAppointments: (params) => api.get("/analytics/appointments", { params }),
  getPatients: (params) => api.get("/analytics/patients", { params }),
  getDoctorPerformance: (doctorId, params) =>
    api.get(`/analytics/doctors/${doctorId}`, { params }),
};

export default api;
