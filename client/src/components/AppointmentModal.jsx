/**
 * AppointmentModal.jsx — Create / edit appointment dialog
 *
 * Renders inside a backdrop overlay. When editing, pre-fills fields
 * from the existing appointment object.  On submit, calls the
 * appointments API and notifies the parent via onSuccess().
 */

import { useState } from "react";
import { X } from "lucide-react";
import { appointmentsAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { format } from "date-fns";

const inputCls =
  "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition";

export default function AppointmentModal({ appointment, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: appointment?.doctor?._id || "",
    patientId: appointment?.patient?._id || "",
    appointmentDate: appointment?.appointmentDate
      ? format(new Date(appointment.appointmentDate), "yyyy-MM-dd")
      : "",
    appointmentTime: appointment?.appointmentTime || "",
    duration: appointment?.duration || 30,
    reason: appointment?.reason || "",
    status: appointment?.status || "scheduled",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (appointment) {
        await appointmentsAPI.update(appointment._id, formData);
        toast.success("Appointment updated successfully");
      } else {
        await appointmentsAPI.create(formData);
        toast.success("Appointment created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {appointment ? "Edit Appointment" : "New Appointment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {user?.role === "patient" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Doctor ID
              </label>
              <input
                type="text"
                name="doctorId"
                required
                value={formData.doctorId}
                onChange={handleChange}
                className={inputCls}
                placeholder="Enter doctor ID"
              />
              <p className="text-xs text-slate-400 mt-1">
                Contact clinic to get doctor ID
              </p>
            </div>
          )}

          {user?.role !== "patient" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Patient ID
              </label>
              <input
                type="text"
                name="patientId"
                required
                value={formData.patientId}
                onChange={handleChange}
                className={inputCls}
                placeholder="Enter patient ID"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                name="appointmentDate"
                required
                value={formData.appointmentDate}
                onChange={handleChange}
                min={format(new Date(), "yyyy-MM-dd")}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Appointment Time
              </label>
              <input
                type="time"
                name="appointmentTime"
                required
                value={formData.appointmentTime}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                required
                min="15"
                step="15"
                value={formData.duration}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            {appointment && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason for Visit
            </label>
            <textarea
              name="reason"
              required
              rows="3"
              value={formData.reason}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition resize-none"
              placeholder="Brief description of the reason for visit"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving…" : appointment ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
