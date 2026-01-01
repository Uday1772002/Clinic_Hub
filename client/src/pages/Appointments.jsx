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
      setAppointments(response.data.data || []);
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

  // Listen for real-time appointment updates
  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CREATED, () => {
    fetchAppointments();
    toast.success("New appointment created!");
  });

  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_UPDATED, () => {
    fetchAppointments();
  });

  useSocketEvent(SOCKET_EVENTS.APPOINTMENT_CANCELLED, () => {
    fetchAppointments();
  });

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

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
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      confirmed: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your appointments</p>
        </div>
        <button
          onClick={handleCreateAppointment}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {["all", "scheduled", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user?.role === "patient"
                            ? `Dr. ${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}`
                            : `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`}
                        </h3>
                        {user?.role !== "patient" &&
                          appointment.doctorId?.specialization && (
                            <p className="text-sm text-gray-500">
                              {appointment.doctorId.specialization}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CalendarIcon size={16} />
                        <span>
                          {format(
                            new Date(appointment.appointmentDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>
                          {appointment.appointmentTime} ({appointment.duration}{" "}
                          min)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start space-x-2">
                      <FileText size={16} className="text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        {appointment.reason}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  {appointment.status !== "cancelled" &&
                    appointment.status !== "completed" && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit appointment"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAppointment(appointment._id)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            fetchAppointments();
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}
