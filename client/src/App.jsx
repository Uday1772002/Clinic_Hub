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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20 animate-pulse">
          <span className="text-white text-2xl font-bold">CH</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-5 w-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading&hellip;</p>
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
