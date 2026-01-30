/**
 * Dashboard.jsx — Landing page after login
 *
 * Shows quick stats (admin/doctor) and a list of upcoming appointments.
 * Listens to Socket.IO events so the data refreshes in real-time.
 */

import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
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

  /** Fetch both upcoming appointments and overview analytics */
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, analyticsRes] = await Promise.all([
        appointmentsAPI.getAll({ status: "scheduled" }),
        user.role !== "patient"
          ? analyticsAPI.getOverview()
          : Promise.resolve({ data: null }),
      ]);

      setUpcomingAppointments(appointmentsRes.data?.data?.appointments ?? []);
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

  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CREATED, () => fetchDashboardData());
  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_UPDATED, () => fetchDashboardData());

  /** Cohesive status badge palette */
  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10",
      completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
      cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
      confirmed: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Patients", value: stats?.totalPatients || 0, icon: Users, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Today\u2019s Appointments", value: stats?.todayAppointments || 0, icon: Calendar, iconBg: "bg-sky-50", iconColor: "text-sky-600" },
    { label: "Completed", value: stats?.completedAppointments || 0, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Cancelled", value: stats?.cancelledAppointments || 0, icon: XCircle, iconBg: "bg-rose-50", iconColor: "text-rose-600" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here&rsquo;s what&rsquo;s happening with your{" "}
          {user?.role === "patient" ? "appointments" : "clinic"} today.
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role !== "patient" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={iconColor} size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Activity size={18} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
        </div>

        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Calendar className="text-indigo-600" size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {user?.role === "patient"
                          ? `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`
                          : `${apt.patient?.firstName} ${apt.patient?.lastName}`}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(new Date(apt.appointmentDate), "MMM dd, yyyy")} &middot; {apt.appointmentTime}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{apt.reason}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${getStatusColor(apt.status)}`}>
                    {apt.status}
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
