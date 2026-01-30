/**
 * Appointments.jsx — Full appointment list with create / cancel
 *
 * Fetches appointments from the backend, renders them in cards
 * grouped by date.  Administrators and patients can open the
 * AppointmentModal to schedule new ones.
 */

import { useEffect, useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  Trash2,
  Edit,
} from "lucide-react";
import { appointmentsAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import AppointmentModal from "../components/AppointmentModal";
import { useSocketEvent, SOCKET_EVENTS } from "../services/socket";

export default function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await appointmentsAPI.getAll(params);
      setAppointments(response.data?.data?.appointments ?? []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CREATED, () => {
    fetchAppointments();
    toast.success("New appointment created!");
  });
  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_UPDATED, () => fetchAppointments());
  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CANCELLED, () => fetchAppointments());

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentsAPI.cancel(id);
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10",
      completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
      cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
      confirmed: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  /** Filter‑tab active/inactive classes */
  const filterCls = (s) =>
    filter === s
      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your appointments</p>
        </div>
        <button
          onClick={handleCreateAppointment}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-600 transition-all text-sm font-medium"
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4">
        <div className="flex flex-wrap gap-2">
          {["all", "scheduled", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCls(s)}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-14">
            <CalendarIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt._id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <User className="text-indigo-600" size={18} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-900">
                          {user?.role === "patient"
                            ? `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`
                            : `${apt.patient?.firstName} ${apt.patient?.lastName}`}
                        </h3>
                        {user?.role !== "patient" && apt.doctor?.specialization && (
                          <p className="text-xs text-slate-400">{apt.doctor.specialization}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarIcon size={14} />
                        <span>{format(new Date(apt.appointmentDate), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        <span>{apt.appointmentTime} ({apt.duration} min)</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start gap-2">
                      <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-500">{apt.reason}</p>
                    </div>

                    <div className="mt-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>

                  {apt.status !== "cancelled" && apt.status !== "completed" && (
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleEditAppointment(apt)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Edit appointment"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(apt._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Cancel appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }}
          onSuccess={() => { fetchAppointments(); setIsModalOpen(false); setSelectedAppointment(null); }}
        />
      )}
    </div>
  );
}
