import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { appointmentsAPI, analyticsAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { format } from "date-fns";
import { useSocketEvent, SOCKET_EVENTS } from "../services/socket";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, analyticsRes] = await Promise.all([
        appointmentsAPI.getAll({ status: "scheduled", limit: 5 }),
        user.role !== "patient"
          ? analyticsAPI.getOverview()
          : Promise.resolve({ data: null }),
      ]);

      setUpcomingAppointments(appointmentsRes.data.data || []);
      if (analyticsRes.data) {
        setStats(analyticsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for real-time appointment updates
  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CREATED, () => {
    fetchDashboardData();
  });

  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_UPDATED, () => {
    fetchDashboardData();
  });

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      confirmed: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your{" "}
          {user?.role === "patient" ? "appointments" : "clinic"} today.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Live updates flow in whenever appointments are created, updated, or
          cancelled.
        </p>
      </div>

      {/* Stats Cards - Only for doctors and admins */}
      {user?.role !== "patient" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl shadow-lg p-6 border border-blue-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {stats.totalPatients || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl shadow-lg p-6 border border-green-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600">
                  Today's Appointments
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {stats.todayAppointments || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl shadow-lg p-6 border border-purple-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600">
                  Completed
                </p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {stats.completedAppointments || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl shadow-lg p-6 border border-red-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">Cancelled</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {stats.cancelledAppointments || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <h2 className="text-lg font-bold text-slate-900">
            📅 Upcoming Appointments
          </h2>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No upcoming appointments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg hover:shadow-md hover:border-blue-200 transition-all border border-slate-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {user?.role === "patient"
                          ? `Dr. ${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}`
                          : `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMM dd, yyyy",
                        )}{" "}
                        at {appointment.appointmentTime}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.status,
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
