/**
 * Patients.jsx — Patient search / browser stub
 *
 * Placeholder page for browsing and searching patients.
 * Will eventually list patients with links to PatientDetails.
 */

import { useState } from "react";
import { Users, Search } from "lucide-react";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Patients
        </h1>
        <p className="text-slate-500 mt-1">View and manage patient records</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search patients by name or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100">
        <div className="text-center py-14">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            Patient records are accessed through appointments
          </p>
          <p className="mt-1 text-xs text-slate-400">
            View patient details from the appointments page
          </p>
        </div>
      </div>
    </div>
  );
}
