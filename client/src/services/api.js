import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent via cookies (withCredentials: true)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    // Handle authentication errors
    if (status === 401 || status === 403) {
      const isLoginPage = window.location.pathname === "/login";
      const isRegisterPage = window.location.pathname === "/register";

      // Only redirect and clear auth if not already on auth pages
      if (!isLoginPage && !isRegisterPage) {
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

    // Show error message for other errors
    const message = error.response?.data?.message || "An error occurred";
    if (!error.config?.skipErrorToast) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Appointments API
export const appointmentsAPI = {
  create: (data) => api.post("/appointments", data),
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
};

// Patients API
export const patientsAPI = {
  getSummary: (patientId) => api.get(`/patients/${patientId}/summary`),
  updateSummary: (patientId, data) =>
    api.put(`/patients/${patientId}/summary`, data),
  addMedication: (patientId, data) =>
    api.post(`/patients/${patientId}/medications`, data),
  addAllergy: (patientId, data) =>
    api.post(`/patients/${patientId}/allergies`, data),
};

// Visit Reports API
export const visitReportsAPI = {
  create: (data) => api.post("/visit-reports", data),
  getAll: (params) => api.get("/visit-reports", { params }),
  getById: (id) => api.get(`/visit-reports/${id}`),
  downloadPDF: (id) =>
    api.get(`/visit-reports/${id}/pdf`, { responseType: "blob" }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview"),
  getPatientVisits: (params) =>
    api.get("/analytics/patient-visits", { params }),
  getAppointmentStats: (params) =>
    api.get("/analytics/appointment-stats", { params }),
};

export default api;
