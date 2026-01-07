import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect, useState } from "react";
import { authAPI } from "./services/api";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import VisitReports from "./pages/VisitReports";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function PrivateRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl font-bold">CH</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Give Zustand persist time to rehydrate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If user is authenticated in store, verify with backend
      if (isAuthenticated) {
        try {
          const response = await authAPI.getMe();
          // Update user data in case it changed
          setAuth(response.data.data.user);
        } catch (error) {
          // Token is invalid, clear auth
          console.error("Auth verification failed:", error);
          clearAuth();
        }
      }

      setIsReady(true);
    };

    initializeAuth();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route
          path="patients"
          element={
            <PrivateRoute allowedRoles={["doctor", "admin"]}>
              <Patients />
            </PrivateRoute>
          }
        />
        <Route
          path="patients/:patientId"
          element={
            <PrivateRoute allowedRoles={["doctor", "admin"]}>
              <PatientDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="visit-reports"
          element={
            <PrivateRoute allowedRoles={["doctor", "admin"]}>
              <VisitReports />
            </PrivateRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <PrivateRoute allowedRoles={["doctor", "admin"]}>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
