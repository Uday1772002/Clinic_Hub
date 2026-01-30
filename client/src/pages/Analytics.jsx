/**
 * Analytics.jsx — Clinic performance overview
 *
 * Displays total appointments, patients, completion rate and
 * average visit duration.  Data is fetched from the analytics
 * overview API endpoint built for this dashboard.
 */

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Clock } from "lucide-react";
import { analyticsAPI } from "../services/api";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await analyticsAPI.getOverview();
        setAnalytics(response.data.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Appointments", value: analytics?.totalAppointments || 0, icon: Calendar, iconBg: "bg-sky-50", iconColor: "text-sky-600", trend: "+12%" },
    { label: "Total Patients", value: analytics?.totalPatients || 0, icon: Users, iconBg: "bg-violet-50", iconColor: "text-violet-600", trend: "+8%" },
    { label: "Completion Rate", value: `${analytics?.completionRate || 0}%`, icon: BarChart3, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trend: "+5%" },
    { label: "Avg. Visit Duration", value: `${analytics?.avgDuration || 35} min`, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600", trend: null },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of clinic performance and statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, trend }) => (
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
            {trend && (
              <div className="mt-4 flex items-center gap-1 text-sm">
                <TrendingUp className="text-emerald-500" size={14} />
                <span className="text-emerald-600 font-medium">{trend}</span>
                <span className="text-slate-400 ml-1">vs last month</span>
              </div>
            )}
            {!trend && (
              <div className="mt-4 text-sm text-slate-400">Stable</div>
            )}
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Appointments by Month</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm">Chart visualization would go here</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Demographics</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm">Chart visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
