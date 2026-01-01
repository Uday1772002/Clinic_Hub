import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect, useState } from "react";
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

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give Zustand persist time to rehydrate
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null; // or return a loading spinner
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
