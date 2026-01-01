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
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }

    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
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
